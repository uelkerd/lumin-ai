"""
Data augmentation utilities for NLP preprocessing.

This module provides functions for augmenting text data to improve model
generalization, particularly in the context of governance text analysis.
"""

import random
import re
from typing import Callable, Dict, List, Optional, Union

import nltk
from nltk.corpus import wordnet

# Download required NLTK resources
try:
    nltk.data.find("corpora/wordnet")
except LookupError:
    nltk.download("wordnet", quiet=True)

try:
    nltk.data.find("taggers/averaged_perceptron_tagger")
except LookupError:
    nltk.download("averaged_perceptron_tagger", quiet=True)


def get_wordnet_pos(tag: str) -> str:
    """
    Map POS tag to WordNet POS tag.

    Args:
        tag: NLTK POS tag

    Returns:
        WordNet POS tag
    """
    tag_map = {"J": wordnet.ADJ, "N": wordnet.NOUN, "V": wordnet.VERB, "R": wordnet.ADV}

    return tag_map.get(tag[0].upper(), wordnet.NOUN)


def synonym_replacement(
    words: List[str], n: int = 1, protect_words: Optional[List[str]] = None
) -> List[str]:
    """
    Replace n random words with synonyms.

    Args:
        words: List of words
        n: Number of words to replace
        protect_words: Words not to replace (e.g., domain-specific terms)

    Returns:
        Augmented list of words
    """
    if not words:
        return []

    protect_words = protect_words or []
    new_words = words.copy()
    random_word_indices = list(range(len(words)))
    random.shuffle(random_word_indices)

    num_replaced = 0
    for idx in random_word_indices:
        if num_replaced >= n:
            break

        word = words[idx]
        if word in protect_words:
            continue

        # Get POS tag
        pos_tag = nltk.pos_tag([word])[0][1]
        wordnet_pos = get_wordnet_pos(pos_tag)

        # Get synonyms
        synonyms = []
        for syn in wordnet.synsets(word, pos=wordnet_pos):
            for lemma in syn.lemmas():
                synonym = lemma.name().replace("_", " ")
                if synonym != word:
                    synonyms.append(synonym)

        # Replace word if synonyms found
        if synonyms:
            new_words[idx] = random.choice(synonyms)
            num_replaced += 1

    return new_words


def random_swap(words: List[str], n: int = 1) -> List[str]:
    """
    Randomly swap positions of words in the list.

    Args:
        words: List of words
        n: Number of swaps to perform

    Returns:
        Augmented list of words
    """
    if len(words) <= 1:
        return words.copy()

    new_words = words.copy()
    for _ in range(n):
        idx1, idx2 = random.sample(range(len(new_words)), 2)
        new_words[idx1], new_words[idx2] = new_words[idx2], new_words[idx1]

    return new_words


def random_deletion(
    words: List[str], p: float = 0.1, protect_words: Optional[List[str]] = None
) -> List[str]:
    """
    Randomly delete words from the list with probability p.

    Args:
        words: List of words
        p: Probability of deleting each word
        protect_words: Words not to delete (e.g., domain-specific terms)

    Returns:
        Augmented list of words
    """
    if not words or p <= 0:
        return words.copy()

    protect_words = protect_words or []
    new_words = []

    for word in words:
        if word in protect_words or random.random() > p:
            new_words.append(word)

    # If all words were deleted, keep a random word
    if not new_words and words:
        new_words.append(random.choice(words))

    return new_words


def random_insertion(words: List[str], n: int = 1) -> List[str]:
    """
    Insert synonyms of random words at random positions.

    Args:
        words: List of words
        n: Number of insertions to perform

    Returns:
        Augmented list of words
    """
    if not words:
        return []

    new_words = words.copy()

    for _ in range(n):
        # Select a random word
        word = random.choice(words)

        # Get POS tag
        pos_tag = nltk.pos_tag([word])[0][1]
        wordnet_pos = get_wordnet_pos(pos_tag)

        # Get synonyms
        synonyms = []
        for syn in wordnet.synsets(word, pos=wordnet_pos):
            for lemma in syn.lemmas():
                synonym = lemma.name().replace("_", " ")
                if synonym != word:
                    synonyms.append(synonym)

        # Insert a random synonym at a random position
        if synonyms:
            synonym = random.choice(synonyms)
            insert_pos = random.randint(0, len(new_words))
            new_words.insert(insert_pos, synonym)

    return new_words


def get_governance_specific_substitutes() -> Dict[str, List[str]]:
    """
    Get governance-specific word substitutions for augmentation.

    Returns:
        Dictionary of words and their domain-specific substitutes
    """
    # This could be expanded significantly based on domain knowledge
    return {
        "government": [
            "administration",
            "authorities",
            "state",
            "regime",
            "governance",
        ],
        "democracy": [
            "democratic system",
            "self-government",
            "popular government",
            "republic",
            "representative government",
        ],
        "election": ["poll", "ballot", "vote", "referendum", "electoral process"],
        "voter": [
            "constituent",
            "elector",
            "citizen",
            "member of electorate",
            "registered voter",
        ],
        "politician": [
            "elected official",
            "public servant",
            "legislator",
            "representative",
            "officeholder",
        ],
        "law": ["legislation", "statute", "regulation", "legal code", "ordinance"],
        "president": [
            "head of state",
            "chief executive",
            "commander in chief",
            "executive",
            "leader",
        ],
        "minister": [
            "secretary",
            "cabinet member",
            "official",
            "government representative",
            "administrator",
        ],
        "parliament": [
            "congress",
            "assembly",
            "legislature",
            "senate",
            "house of representatives",
        ],
        "policy": ["plan", "strategy", "approach", "program", "course of action"],
    }


def governance_specific_augmentation(text: str, substitute_prob: float = 0.3) -> str:
    """
    Augment text with governance-specific word substitutions.

    Args:
        text: Input text
        substitute_prob: Probability of substituting a matching word

    Returns:
        Augmented text
    """
    substitutes = get_governance_specific_substitutes()
    words = text.split()
    new_words = []

    for word in words:
        # Extract the word without punctuation
        word_lower = re.sub(r"[^\w\s]", "", word.lower())

        if word_lower in substitutes and random.random() < substitute_prob:
            # Keep original capitalization and punctuation pattern
            prefix = ""
            suffix = ""

            # Extract prefix punctuation
            match = re.match(r"([^\w]*)(.+)", word)
            if match:
                prefix = match.group(1)
                word = match.group(2)

            # Extract suffix punctuation
            match = re.match(r"(.+?)([^\w]*)$", word)
            if match:
                word = match.group(1)
                suffix = match.group(2)

            # Choose a substitute and apply original capitalization
            substitute = random.choice(substitutes[word_lower])
            if word[0].isupper():
                if " " in substitute:
                    parts = substitute.split()
                    parts[0] = parts[0].capitalize()
                    substitute = " ".join(parts)
                else:
                    substitute = substitute.capitalize()

            new_words.append(prefix + substitute + suffix)
        else:
            new_words.append(word)

    return " ".join(new_words)


def create_augmented_examples(
    text: str,
    n_examples: int = 2,
    augmentation_methods: List[Callable] = None,
    protect_words: Optional[List[str]] = None,
) -> List[str]:
    """
    Create multiple augmented examples from a single text input.

    Args:
        text: Input text
        n_examples: Number of augmented examples to create
        augmentation_methods: List of augmentation methods to apply
        protect_words: Words to protect from certain augmentations

    Returns:
        List of augmented examples
    """
    if not augmentation_methods:
        augmentation_methods = [
            lambda w: synonym_replacement(w, n=max(1, len(w) // 10), protect_words=protect_words),
            lambda w: random_swap(w, n=max(1, len(w) // 10)),
            lambda w: random_deletion(w, p=0.1, protect_words=protect_words),
            lambda w: random_insertion(w, n=max(1, len(w) // 10)),
            lambda w, t=text: governance_specific_augmentation(t),
        ]

    words = text.split()
    augmented_examples = []

    for _ in range(n_examples):
        # Choose a random augmentation method
        aug_method = random.choice(augmentation_methods)

        if aug_method.__code__.co_argcount > 1 and aug_method.__defaults__:
            # This is a method that takes the full text
            augmented_words = aug_method()
        else:
            # This is a method that takes words
            augmented_words = aug_method(words)

        if isinstance(augmented_words, list):
            augmented_examples.append(" ".join(augmented_words))
        else:
            augmented_examples.append(augmented_words)

    return augmented_examples


def augment_dataset(texts: List[str], n_examples_per_text: int = 1, **kwargs) -> List[str]:
    """
    Augment a dataset by creating new examples from each text.

    Args:
        texts: List of text examples
        n_examples_per_text: Number of augmented examples to create per input
        **kwargs: Additional arguments to pass to create_augmented_examples

    Returns:
        List of original and augmented texts
    """
    augmented_texts = []

    for text in texts:
        augmented_texts.append(text)  # Keep original text
        augmented_examples = create_augmented_examples(
            text, n_examples=n_examples_per_text, **kwargs
        )
        augmented_texts.extend(augmented_examples)

    return augmented_texts


def balance_dataset(
    texts: List[str],
    labels: List[Union[int, str]],
    augment_factor: Dict[Union[int, str], int] = None,
) -> tuple:
    """
    Balance dataset by augmenting underrepresented classes.

    Args:
        texts: List of text examples
        labels: List of corresponding labels
        augment_factor: Dictionary mapping label to number of augmented examples
                        to create per original example

    Returns:
        Tuple of (balanced texts, balanced labels)
    """
    if not augment_factor:
        # Count labels
        label_counts = {}
        for label in labels:
            label_counts[label] = label_counts.get(label, 0) + 1

        # Find the most frequent label
        max_count = max(label_counts.values())

        # Calculate augmentation factor for each label
        augment_factor = {}
        for label, count in label_counts.items():
            if count < max_count:
                # Calculate how many examples to create per original
                factor = max(1, (max_count - count) // count)
                augment_factor[label] = factor
            else:
                augment_factor[label] = 0

    # Augment texts to balance dataset
    balanced_texts = []
    balanced_labels = []

    for text, label in zip(texts, labels):
        # Add original text and label
        balanced_texts.append(text)
        balanced_labels.append(label)

        # Augment if needed
        factor = augment_factor.get(label, 0)
        if factor > 0:
            augmented_examples = create_augmented_examples(text, n_examples=factor)
            balanced_texts.extend(augmented_examples)
            balanced_labels.extend([label] * len(augmented_examples))

    return balanced_texts, balanced_labels
