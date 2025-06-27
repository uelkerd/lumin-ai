"""
Feature extraction utilities for NLP preprocessing.

This module provides functions for transforming text into numerical features,
including traditional approaches (TF-IDF, Bag of Words) and more modern
embeddings-based approaches.
"""

from collections import Counter
from typing import Dict, List, Optional, Tuple

import numpy as np
from gensim.models import Word2Vec
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

# Load spaCy model (commented out - uncomment and run with appropriate model)
# try:
#     nlp = spacy.load("en_core_web_sm")
# except OSError:
#     import sys
#     sys.exit("SpaCy model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm")


def build_vocabulary(
    documents: List[List[str]], min_df: int = 2, max_df: float = 0.95
) -> Dict[str, int]:
    """
    Build a vocabulary from documents.

    Args:
        documents: List of tokenized documents (each a list of tokens)
        min_df: Minimum document frequency for a term to be included
        max_df: Maximum document frequency for a term to be included (proportion)

    Returns:
        Dictionary mapping terms to indices
    """
    # Count term frequencies across documents
    doc_count = len(documents)
    term_doc_freq = Counter()

    for doc in documents:
        # Count unique terms in document
        doc_terms = set(doc)
        for term in doc_terms:
            term_doc_freq[term] += 1

    # Filter by document frequency
    vocabulary = {}
    idx = 0

    for term, doc_freq in term_doc_freq.items():
        if min_df <= doc_freq <= max_df * doc_count:
            vocabulary[term] = idx
            idx += 1

    return vocabulary


def create_bow_features(
    documents: List[str],
    vectorizer: Optional[CountVectorizer] = None,
    binary: bool = False,
    vocabulary: Optional[Dict[str, int]] = None,
    **kwargs,
) -> Tuple[np.ndarray, CountVectorizer]:
    """
    Create Bag-of-Words features from documents.

    Args:
        documents: List of documents (text strings)
        vectorizer: Pre-fitted CountVectorizer (if None, new one is created)
        binary: Whether to create binary features (presence/absence) or counts
        vocabulary: Optional pre-built vocabulary
        **kwargs: Additional arguments to pass to CountVectorizer

    Returns:
        Tuple of (feature matrix, vectorizer)
    """
    if vectorizer is None:
        vectorizer = CountVectorizer(binary=binary, vocabulary=vocabulary, **kwargs)
        bow_features = vectorizer.fit_transform(documents)
    else:
        bow_features = vectorizer.transform(documents)

    return bow_features, vectorizer


def create_tfidf_features(
    documents: List[str],
    vectorizer: Optional[TfidfVectorizer] = None,
    vocabulary: Optional[Dict[str, int]] = None,
    **kwargs,
) -> Tuple[np.ndarray, TfidfVectorizer]:
    """
    Create TF-IDF features from documents.

    Args:
        documents: List of documents (text strings)
        vectorizer: Pre-fitted TfidfVectorizer (if None, new one is created)
        vocabulary: Optional pre-built vocabulary
        **kwargs: Additional arguments to pass to TfidfVectorizer

    Returns:
        Tuple of (feature matrix, vectorizer)
    """
    if vectorizer is None:
        vectorizer = TfidfVectorizer(vocabulary=vocabulary, **kwargs)
        tfidf_features = vectorizer.fit_transform(documents)
    else:
        tfidf_features = vectorizer.transform(documents)

    return tfidf_features, vectorizer


def create_word2vec_embeddings(
    tokenized_documents: List[List[str]],
    vector_size: int = 100,
    window: int = 5,
    min_count: int = 2,
    workers: int = 4,
    **kwargs,
) -> Word2Vec:
    """
    Train a Word2Vec model on documents.

    Args:
        tokenized_documents: List of tokenized documents
        vector_size: Size of the word vectors
        window: Maximum distance between current and predicted word
        min_count: Minimum word count to be included in vocabulary
        workers: Number of worker threads
        **kwargs: Additional arguments to pass to Word2Vec

    Returns:
        Trained Word2Vec model
    """
    model = Word2Vec(
        sentences=tokenized_documents,
        vector_size=vector_size,
        window=window,
        min_count=min_count,
        workers=workers,
        **kwargs,
    )

    return model


def document_embedding_average(
    tokenized_document: List[str], word_vectors: Dict[str, np.ndarray]
) -> np.ndarray:
    """
    Create document embedding by averaging word vectors.

    Args:
        tokenized_document: Tokenized document (list of tokens)
        word_vectors: Dictionary mapping words to their vector representations

    Returns:
        Document embedding vector
    """
    # Get dimensions from first word vector
    if not word_vectors or not tokenized_document:
        return np.array([])

    # Get vector dimension from any word in the dictionary
    for word in word_vectors:
        vec_dim = len(word_vectors[word])
        break

    # Initialize document vector
    doc_vector = np.zeros(vec_dim)
    word_count = 0

    # Sum vectors for words in document
    for token in tokenized_document:
        if token in word_vectors:
            doc_vector += word_vectors[token]
            word_count += 1

    # Average vectors
    if word_count > 0:
        doc_vector = doc_vector / word_count

    return doc_vector


def create_document_embeddings(
    tokenized_documents: List[List[str]], word_vectors: Dict[str, np.ndarray]
) -> np.ndarray:
    """
    Create document embeddings for a corpus by averaging word vectors.

    Args:
        tokenized_documents: List of tokenized documents
        word_vectors: Dictionary mapping words to their vector representations

    Returns:
        Matrix of document embeddings
    """
    # Get vector dimension
    for word in word_vectors:
        vec_dim = len(word_vectors[word])
        break

    # Create embeddings for each document
    doc_embeddings = np.zeros((len(tokenized_documents), vec_dim))

    for i, doc in enumerate(tokenized_documents):
        doc_embeddings[i] = document_embedding_average(doc, word_vectors)

    return doc_embeddings


def extract_political_entities(documents: List[str], nlp=None) -> List[List[Dict[str, str]]]:
    """
    Extract political entities from documents using spaCy NER.

    Args:
        documents: List of documents
        nlp: spaCy model (if None, uses en_core_web_sm)

    Returns:
        List of entity dictionaries for each document
    """
    # Import and load model if not provided
    if nlp is None:
        import spacy

        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise ImportError(
                "SpaCy model 'en_core_web_sm' not found. "
                "Install with: python -m spacy download en_core_web_sm"
            )

    political_entity_types = {"ORG", "PERSON", "GPE", "NORP", "FAC", "LOC"}

    # Process each document
    all_doc_entities = []
    for doc_text in documents:
        doc = nlp(doc_text)
        doc_entities = []

        for ent in doc.ents:
            if ent.label_ in political_entity_types:
                entity_info = {
                    "text": ent.text,
                    "type": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                }
                doc_entities.append(entity_info)

        all_doc_entities.append(doc_entities)

    return all_doc_entities
