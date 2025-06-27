"""
Tokenization utilities for NLP preprocessing.

This module provides functions for text tokenization specialized for
governance text analysis, including methods for handling domain-specific terms.
"""

import re
from typing import Callable, List, Optional, Set

import nltk
from nltk.tokenize import sent_tokenize, word_tokenize


# Download required NLTK resources
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", quiet=True)

# Political/governance-specific multi-word expressions to preserve
GOVERNANCE_PHRASES = [
    "civil society",
    "public policy",
    "rule of law",
    "human rights",
    "democratic institutions",
    "electoral system",
    "civil liberties",
    "policy reform",
    "citizen participation",
    "political parties",
    "federal government",
    "state government",
    "local government",
    "checks and balances",
    "separation of powers",
    "public interest",
    "legislative process",
    "constitutional court",
    "executive order",
    "social contract",
    "democratic norms",
    "policy implementation",
    "electoral commission",
    "voter registration",
    "campaign finance",
    "political reform",
    "governance structure",
    "public administration",
    "parliamentary debate",
    "legislation process",
    "power sharing",
    "civil rights",
    "voting rights",
    "freedom of speech",
    "freedom of press",
    "right to assembly",
    "democratic deficit",
    "democratic backsliding",
    "political polarization",
    "civic engagement",
    "democratic transition",
    "governance indicators",
    "accountability mechanisms",
    "transparency initiatives",
]


def tokenize_text(text: str, method: str = "word") -> List[str]:
    """
    Tokenize text into words or sentences.

    Args:
        text: Text to tokenize
        method: Tokenization method ('word' or 'sentence')

    Returns:
        List of tokens (words or sentences)
    """
    if not text:
        return []

    if method.lower() == "word":
        return word_tokenize(text)
    elif method.lower() == "sentence":
        return sent_tokenize(text)
    else:
        raise ValueError("Method must be 'word' or 'sentence'")


def preserve_governance_phrases(
    text: str, phrases: List[str] = GOVERNANCE_PHRASES
) -> str:
    """
    Preserve governance-specific phrases by replacing spaces with underscores.

    Args:
        text: Input text
        phrases: List of phrases to preserve

    Returns:
        Text with preserved phrases (spaces replaced with underscores)
    """
    # Sort phrases by length (descending) to prioritize longer phrases
    sorted_phrases = sorted(phrases, key=len, reverse=True)

    # Compile regex patterns for each phrase
    patterns = [
        (re.compile(rf"\b{re.escape(phrase)}\b", re.IGNORECASE), phrase)
        for phrase in sorted_phrases
    ]

    # Replace phrases with underscored versions
    for pattern, phrase in patterns:
        underscored = phrase.replace(" ", "_")
        text = pattern.sub(underscored, text)

    return text


def custom_governance_tokenizer(
    text: str, preserve_phrases: bool = True, lowercase: bool = True
) -> List[str]:
    """
    Custom tokenizer for governance text that preserves important phrases.

    Args:
        text: Text to tokenize
        preserve_phrases: Whether to preserve governance phrases as single tokens
        lowercase: Whether to lowercase tokens

    Returns:
        List of tokens
    """
    if preserve_phrases:
        text = preserve_governance_phrases(text)

    # Split on whitespace and punctuation
    tokens = re.findall(r"\b\w[\w\'_]*\b", text)

    if lowercase:
        tokens = [token.lower() for token in tokens]

    # Restore preserved phrases (replace underscores with spaces)
    if preserve_phrases:
        tokens = [
            token.replace("_", " ") if "_" in token else token for token in tokens
        ]

    return tokens


def get_ngrams(tokens: List[str], n: int) -> List[str]:
    """
    Generate n-grams from a list of tokens.

    Args:
        tokens: List of tokens
        n: N-gram size

    Returns:
        List of n-grams
    """
    if not tokens or n <= 0 or n > len(tokens):
        return []

    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


def batch_tokenize(
    texts: List[str], tokenize_func: Callable = custom_governance_tokenizer, **kwargs
) -> List[List[str]]:
    """
    Tokenize a batch of texts.

    Args:
        texts: List of texts to tokenize
        tokenize_func: Tokenization function to use
        **kwargs: Additional arguments to pass to the tokenization function

    Returns:
        List of tokenized texts
    """
    return [tokenize_func(text, **kwargs) for text in texts]


def tokenize_and_filter(
    text: str,
    min_token_length: int = 2,
    max_token_length: int = 50,
    stopwords: Optional[Set[str]] = None,
    **kwargs,
) -> List[str]:
    """
    Tokenize text and filter tokens based on length and stopwords.

    Args:
        text: Text to tokenize
        min_token_length: Minimum token length to keep
        max_token_length: Maximum token length to keep
        stopwords: Set of stopwords to remove
        **kwargs: Additional arguments to pass to custom_governance_tokenizer

    Returns:
        List of filtered tokens
    """
    tokens = custom_governance_tokenizer(text, **kwargs)

    # Filter by length
    tokens = [
        token for token in tokens if min_token_length <= len(token) <= max_token_length
    ]

    # Filter stopwords if provided
    if stopwords:
        tokens = [token for token in tokens if token not in stopwords]

    return tokens
