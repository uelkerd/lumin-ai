"""
Configuration utilities for preprocessing pipeline.

This module provides configuration settings and paths for the preprocessing
pipeline, including default parameters for various preprocessing steps.
"""

import os
from typing import Any, Dict, Set


# Path handling
def get_project_root() -> str:
    """Get absolute path to project root directory."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))


def get_data_dir() -> str:
    """Get absolute path to data directory."""
    return os.path.join(get_project_root(), "data")


def get_models_dir() -> str:
    """Get absolute path to models directory."""
    return os.path.join(get_project_root(), "models")


# Default preprocessing settings
DEFAULT_TEXT_CLEANING_CONFIG: Dict[str, Any] = {
    "lowercase": True,
    "expand_contractions": True,
    "remove_punct": True,
    "normalize_chars": True,
}

DEFAULT_TOKENIZATION_CONFIG: Dict[str, Any] = {
    "preserve_phrases": True,
    "lowercase": True,
    "min_token_length": 2,
    "max_token_length": 50,
}

# Governance domain-specific stopwords
# Common English stopwords that don't carry domain significance
COMMON_STOPWORDS: Set[str] = {
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "if",
    "because",
    "as",
    "until",
    "while",
    "of",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "don't",
    "should",
    "should've",
    "now",
    "d",
    "ll",
    "m",
    "o",
    "re",
    "ve",
    "y",
    "ain",
    "aren",
    "aren't",
    "couldn",
    "couldn't",
    "didn",
    "didn't",
    "doesn",
    "doesn't",
    "hadn",
    "hadn't",
    "hasn",
    "hasn't",
    "haven",
    "haven't",
    "isn",
    "isn't",
    "ma",
    "mightn",
    "mightn't",
    "mustn",
    "mustn't",
    "needn",
    "needn't",
    "shan",
    "shan't",
    "shouldn",
    "shouldn't",
    "wasn",
    "wasn't",
    "weren",
    "weren't",
    "won",
    "won't",
    "wouldn",
    "wouldn't",
}

# Feature extraction settings
DEFAULT_FEATURE_EXTRACTION_CONFIG: Dict[str, Any] = {
    "tfidf_params": {
        "min_df": 2,
        "max_df": 0.95,
        "max_features": 5000,
        "ngram_range": (1, 2),
        "use_idf": True,
        "smooth_idf": True,
        "sublinear_tf": True,
    },
    "word2vec_params": {
        "vector_size": 100,
        "window": 5,
        "min_count": 2,
        "workers": 4,
        "sg": 1,  # Skip-gram (vs CBOW)
        "epochs": 20,
    },
}

# Data augmentation settings
DEFAULT_DATA_AUGMENTATION_CONFIG: Dict[str, Any] = {
    "synonym_replacement_prob": 0.1,
    "random_swap_prob": 0.1,
    "random_deletion_prob": 0.1,
    "random_insertion_prob": 0.1,
    "governance_substitution_prob": 0.3,
    "augment_minority_classes": True,
    "max_augmentation_per_example": 2,
}

# Political entity recognition
POLITICAL_ENTITY_TYPES: Set[str] = {
    "ORG",  # Organization
    "PERSON",  # Person
    "GPE",  # Geo-political entity
    "NORP",  # Nationalities or religious or political groups
    "FAC",  # Facilities
    "LOC",  # Non-GPE locations
    "EVENT",  # Named events
    "LAW",  # Laws
    "DATE",  # Specific dates or periods
    "PERCENT",  # Percentage
    "MONEY",  # Monetary values
    "ORDINAL",  # Ordinals
}
