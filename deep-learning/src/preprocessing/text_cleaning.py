"""
Text cleaning utilities for NLP preprocessing.

This module provides functions for text normalization, punctuation handling,
and other text cleaning operations specific to governance text analysis.
"""

import re
import string
import unicodedata
from typing import Dict, List, Optional, Set


# Common contractions mapping
CONTRACTIONS = {
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "he'd": "he would",
    "he'll": "he will",
    "he's": "he is",
    "i'd": "i would",
    "i'll": "i will",
    "i'm": "i am",
    "i've": "i have",
    "isn't": "is not",
    "it's": "it is",
    "let's": "let us",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they'd": "they would",
    "they'll": "they will",
    "they're": "they are",
    "they've": "they have",
    "we'd": "we would",
    "we're": "we are",
    "we've": "we have",
    "weren't": "were not",
    "what'll": "what will",
    "what're": "what are",
    "what's": "what is",
    "what've": "what have",
    "where's": "where is",
    "who's": "who is",
    "who'll": "who will",
    "who're": "who are",
    "who've": "who have",
    "won't": "will not",
    "wouldn't": "would not",
    "you'd": "you would",
    "you'll": "you will",
    "you're": "you are",
    "you've": "you have",
}

# Democracy and governance specific stopwords to preserve
GOVERNANCE_TERMS = {
    "democracy",
    "democratic",
    "government",
    "governance",
    "policy",
    "policies",
    "election",
    "elections",
    "vote",
    "voting",
    "rights",
    "constitution",
    "constitutional",
    "parliament",
    "parliamentary",
    "senate",
    "congress",
    "legislative",
    "judiciary",
    "executive",
    "president",
    "prime minister",
    "minister",
    "citizen",
    "citizens",
    "civic",
    "civil",
    "public",
    "republic",
    "freedom",
    "liberty",
    "justice",
    "equality",
    "representation",
    "representative",
    "transparency",
    "accountability",
    "corruption",
    "reform",
}


def normalize_unicode(text: str) -> str:
    """
    Normalize Unicode characters to their closest ASCII representation.

    Args:
        text: The text to normalize

    Returns:
        Normalized text with Unicode characters converted to ASCII
    """
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")


def expand_contractions(
    text: str, contractions_dict: Dict[str, str] = CONTRACTIONS
) -> str:
    """
    Expand contractions in text.

    Args:
        text: The text containing contractions
        contractions_dict: Dictionary mapping contractions to their expanded form

    Returns:
        Text with expanded contractions
    """
    pattern = re.compile(
        r"\b({})\b".format("|".join(contractions_dict.keys())),
        flags=re.IGNORECASE | re.DOTALL,
    )

    def replace(match):
        match_str = match.group(0)
        if match_str.lower() in contractions_dict:
            return contractions_dict[match_str.lower()]
        else:
            first_char = match_str[0]
            expanded = contractions_dict.get(match_str.lower())
            if expanded:
                return first_char + expanded[1:] if first_char.isupper() else expanded
            return match_str

    return pattern.sub(replace, text)


def remove_punctuation(text: str, preserve: Optional[Set[str]] = None) -> str:
    """
    Remove punctuation from text.

    Args:
        text: The text to clean
        preserve: Set of punctuation marks to preserve

    Returns:
        Text with punctuation removed except for those in preserve
    """
    if preserve:
        punct_to_remove = "".join([p for p in string.punctuation if p not in preserve])
        translator = str.maketrans("", "", punct_to_remove)
    else:
        translator = str.maketrans("", "", string.punctuation)

    return text.translate(translator)


def remove_extra_whitespace(text: str) -> str:
    """
    Remove extra whitespace including newlines and tabs.

    Args:
        text: The text to clean

    Returns:
        Text with standardized whitespace
    """
    return " ".join(text.split())


def lowercase_text(text: str, preserve_proper_nouns: bool = False) -> str:
    """
    Convert text to lowercase.

    Args:
        text: The text to convert
        preserve_proper_nouns: If True, attempt to preserve capitalization of proper nouns
                              (Note: This is a simplified implementation)

    Returns:
        Lowercase text with optional proper noun preservation
    """
    if not preserve_proper_nouns:
        return text.lower()

    # Simple proper noun detection (preserves capitalized words not at sentence start)
    words = []
    sentences = re.split(r"(?<=[.!?])\s+", text)

    for sentence in sentences:
        sentence_words = sentence.split()
        for i, word in enumerate(sentence_words):
            # Keep capitalization if not the first word of a sentence and starts with a capital
            if i > 0 and word and word[0].isupper():
                words.append(word)
            else:
                words.append(word.lower())

    return " ".join(words)


def clean_governance_text(
    text: str,
    lowercase: bool = True,
    expand_contractions_flag: bool = True,
    remove_punct: bool = True,
    normalize_chars: bool = True,
) -> str:
    """
    Apply a full cleaning pipeline specialized for governance text.

    Args:
        text: The text to clean
        lowercase: Whether to convert to lowercase
        expand_contractions_flag: Whether to expand contractions
        remove_punct: Whether to remove punctuation
        normalize_chars: Whether to normalize Unicode characters

    Returns:
        Cleaned text
    """
    if not text:
        return ""

    # Normalize unicode characters
    if normalize_chars:
        text = normalize_unicode(text)

    # Expand contractions
    if expand_contractions_flag:
        text = expand_contractions(text)

    # Remove punctuation
    if remove_punct:
        text = remove_punctuation(text)

    # Standardize whitespace
    text = remove_extra_whitespace(text)

    # Convert to lowercase
    if lowercase:
        text = text.lower()

    return text


def clean_text_batch(texts: List[str], **kwargs) -> List[str]:
    """
    Clean a batch of texts using the governance text cleaning pipeline.

    Args:
        texts: List of texts to clean
        **kwargs: Arguments to pass to clean_governance_text

    Returns:
        List of cleaned texts
    """
    return [clean_governance_text(text, **kwargs) for text in texts]
