"""
Complete governance text preprocessing pipeline.

This module combines all preprocessing steps into a unified pipeline,
providing functions for both training and inference.
"""

import json
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import spacy

from ..utils import config
from . import data_augmentation, feature_extraction, text_cleaning, tokenization


def preprocess_governance_text(
    texts: List[str], labels: Optional[List[str]] = None, mode: str = "train"
) -> Dict[str, Any]:
    """
    Complete preprocessing pipeline for governance text analysis.

    Args:
        texts: List of raw texts
        labels: Optional list of labels
        mode: 'train' or 'predict' mode

    Returns:
        Dictionary with preprocessed features and metadata
    """
    print(f"Starting preprocessing pipeline in {mode} mode...")
    results = {"pipeline_steps": []}

    # Step 1: Text cleaning
    print("Step 1: Text cleaning...")
    cleaned_texts = text_cleaning.clean_text_batch(texts)
    results["cleaned_texts"] = cleaned_texts
    results["pipeline_steps"].append("text_cleaning")

    # Step 2: Tokenization
    print("Step 2: Governance-specific tokenization...")
    tokenized_texts = [
        tokenization.custom_governance_tokenizer(text) for text in cleaned_texts
    ]
    results["tokenized_texts"] = tokenized_texts
    results["pipeline_steps"].append("tokenization")

    # Step 3: Feature extraction
    print("Step 3: Feature extraction...")

    # 3.1: TF-IDF features
    tfidf_features, tfidf_vectorizer = feature_extraction.create_tfidf_features(
        cleaned_texts,
        **config.DEFAULT_FEATURE_EXTRACTION_CONFIG.get("tfidf_params", {}),
    )
    results["tfidf_features"] = tfidf_features
    results["tfidf_vectorizer"] = tfidf_vectorizer

    # 3.2: Word embeddings (if in training mode)
    if mode == "train":
        w2v_model = feature_extraction.create_word2vec_embeddings(
            tokenized_texts,
            **config.DEFAULT_FEATURE_EXTRACTION_CONFIG.get("word2vec_params", {}),
        )
        results["word2vec_model"] = w2v_model

        # Create document embeddings
        word_vectors = {word: w2v_model.wv[word] for word in w2v_model.wv.index_to_key}
        doc_embeddings = feature_extraction.create_document_embeddings(
            tokenized_texts, word_vectors
        )
        results["doc_embeddings"] = doc_embeddings

    results["pipeline_steps"].append("feature_extraction")

    # Step 4: Named entity recognition (optional)
    try:
        print("Step 4: Political entity extraction...")
        # Try to load the spaCy model
        nlp = spacy.load("en_core_web_sm")
        political_entities = feature_extraction.extract_political_entities(texts, nlp)
        results["political_entities"] = political_entities
        results["pipeline_steps"].append("entity_extraction")
    except Exception as e:
        print(f"Skipping entity extraction: {e}")

    # Step 5: Data balancing and augmentation (only in training mode)
    if mode == "train" and labels is not None:
        print("Step 5: Dataset balancing and augmentation...")
        try:
            augmented_texts, augmented_labels = data_augmentation.balance_dataset(
                texts, labels
            )
            results["augmented_texts"] = augmented_texts
            results["augmented_labels"] = augmented_labels
            results["pipeline_steps"].append("data_augmentation")
        except Exception as e:
            print(f"Skipping data augmentation: {e}")

    print("Preprocessing pipeline completed successfully.")
    return results


def save_pipeline_components(
    results: Dict[str, Any], output_dir: Union[str, Path]
) -> None:
    """
    Save preprocessing pipeline components.

    Args:
        results: Pipeline results dictionary
        output_dir: Directory to save components
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)

    # Save vectorizers
    if "tfidf_vectorizer" in results:
        with open(output_dir / "tfidf_vectorizer.pkl", "wb") as f:
            pickle.dump(results["tfidf_vectorizer"], f)

    # Save Word2Vec model
    if "word2vec_model" in results:
        results["word2vec_model"].save(str(output_dir / "word2vec_model.w2v"))

    # Save preprocessing configuration
    pipeline_config = {
        "steps": results["pipeline_steps"],
        "has_tfidf": "tfidf_vectorizer" in results,
        "has_word2vec": "word2vec_model" in results,
    }

    with open(output_dir / "pipeline_config.json", "w") as f:
        json.dump(pipeline_config, f, indent=2)

    print(f"Pipeline components saved to {output_dir}")


def load_pipeline_components(input_dir: Union[str, Path]) -> Dict[str, Any]:
    """
    Load preprocessing pipeline components.

    Args:
        input_dir: Directory containing saved components

    Returns:
        Dictionary of loaded components
    """
    input_dir = Path(input_dir)
    results = {}

    # Load pipeline configuration
    try:
        with open(input_dir / "pipeline_config.json", "r") as f:
            pipeline_config = json.load(f)
            results["pipeline_steps"] = pipeline_config["steps"]
    except FileNotFoundError:
        print("Pipeline configuration not found.")
        return {}

    # Load TF-IDF vectorizer if available
    if pipeline_config.get("has_tfidf", False):
        try:
            with open(input_dir / "tfidf_vectorizer.pkl", "rb") as f:
                results["tfidf_vectorizer"] = pickle.load(f)
        except FileNotFoundError:
            print("TF-IDF vectorizer not found.")

    # Load Word2Vec model if available
    if pipeline_config.get("has_word2vec", False):
        try:
            from gensim.models import Word2Vec

            results["word2vec_model"] = Word2Vec.load(
                str(input_dir / "word2vec_model.w2v")
            )
        except FileNotFoundError:
            print("Word2Vec model not found.")
        except Exception as e:
            print(f"Error loading Word2Vec model: {e}")

    print(f"Pipeline components loaded from {input_dir}")
    return results


def preprocess_for_inference(
    text: str, loaded_components: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Apply preprocessing pipeline to new text using saved components.

    Args:
        text: Input text
        loaded_components: Dictionary of loaded pipeline components

    Returns:
        Dictionary with preprocessed features
    """
    if not loaded_components:
        print("No pipeline components loaded.")
        return {"cleaned_text": text, "tokens": [], "features": {}}

    # Clean text
    cleaned_text = text_cleaning.clean_governance_text(text)

    # Tokenize
    tokens = tokenization.custom_governance_tokenizer(cleaned_text)

    # Extract features
    features = {}

    # TF-IDF features
    if "tfidf_vectorizer" in loaded_components:
        tfidf_features = loaded_components["tfidf_vectorizer"].transform([cleaned_text])
        features["tfidf"] = tfidf_features

    # Word2Vec features
    if "word2vec_model" in loaded_components:
        w2v_model = loaded_components["word2vec_model"]

        # Create document embedding
        word_vectors = {word: w2v_model.wv[word] for word in w2v_model.wv.index_to_key}
        doc_embedding = feature_extraction.document_embedding_average(
            tokens, word_vectors
        )

        if len(doc_embedding) > 0:
            features["word2vec"] = doc_embedding

    return {"cleaned_text": cleaned_text, "tokens": tokens, "features": features}
