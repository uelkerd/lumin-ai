# Deep Learning Track - LUMIN.AI

## Overview

This track focuses on developing neural networks for analyzing democratic governance texts, including sentiment analysis, participation prediction, and governance theme classification.

## Models

1. **Sentiment Analyzer** - BERT-based model for governance text sentiment
2. **Participation Predictor** - LSTM network predicting citizen engagement
3. **Theme Classifier** - Multi-label classification for governance topics

## Setup

```bash
pip install -r ../requirements.txt
python -m spacy download en_core_web_sm
```

## Project Structure

- **notebooks/** - Jupyter notebooks for development and exploration
  - **01-data-exploration.ipynb** - Initial data exploration and preprocessing
  - **02-sentiment-analysis-mvp.ipynb** - Sentiment analysis MVP implementation
  - **03-participation-prediction.ipynb** - Participation prediction model
  - **04-text-classification.ipynb** - Governance theme classification
  - **05-advanced-transformers.ipynb** - Advanced transformer models

## Development Roadmap

We are following the roadmap outlined in `docs/architecture/DeepLearn--ROADMAP.md`:

### Week 1: Foundation & Setup

- [x] Development environment configuration
- [x] Initial data exploration
- [ ] Team formation and role assignments
- [x] Basic sentiment analysis tutorial completion

### Week 2-6: MVP Development

- [🔄] Data preprocessing pipeline
- [🔄] Baseline sentiment classifier
- [ ] Neural network implementation
- [ ] API development
- [ ] Integration with other tracks

## Running the Notebooks

To run the Jupyter notebooks:

1. Ensure you have installed all dependencies:

```bash
pip install -r ../requirements.txt
python -m spacy download en_core_web_sm
```

2. Start Jupyter:

```bash
jupyter notebook
```

3. Navigate to the notebooks directory and open the desired notebook.

## Data

We are using the Austria Democracy Radar dataset as specified in the PRD. Sample data is available in `data/examples/`, and the full dataset can be downloaded using the script in `data/scripts/download_data.py`.

## Preprocessing Pipeline

The preprocessing pipeline for governance text analysis is implemented in the `src/preprocessing` directory. It includes the following components:

- **Text Cleaning**: Functions for text normalization, punctuation handling, and specialized governance text processing (`text_cleaning.py`).
- **Tokenization**: Functions for text tokenization, including specialized methods for handling domain-specific governance terms (`tokenization.py`).
- **Feature Extraction**: Functions for transforming text into numerical features, including BoW, TF-IDF, and word embeddings (`feature_extraction.py`).
- **Data Augmentation**: Functions for augmenting text data to improve model generalization, particularly for governance text (`data_augmentation.py`).

A demonstration of the complete preprocessing pipeline is available in the `notebooks/03-preprocessing-pipeline.ipynb` notebook.

### Using the Pipeline

To use the preprocessing pipeline:

1. Install required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Import the preprocessing modules:

   ```python
   from src.preprocessing import text_cleaning, tokenization, feature_extraction, data_augmentation
   from src.utils import config
   ```

3. Use the complete pipeline function:

   ```python
   from src.preprocessing.pipeline import preprocess_governance_text

   # For training
   pipeline_results = preprocess_governance_text(texts, labels, mode='train')

   # For inference
   pipeline_results = preprocess_governance_text(texts, mode='predict')
   ```
