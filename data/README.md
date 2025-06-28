## 📂 data/README.md

```markdown
# Data Directory - LUMIN.AI

## Overview

This directory contains all datasets used across LUMIN.AI tracks. Data is organized into raw (original) and processed (cleaned/transformed) formats. Due to size constraints, actual data files are not stored in Git but can be downloaded using provided scripts.

## 📁 Directory Structure
```

data/
├── raw/ # Original, unmodified datasets
│ ├── democracy-radar/ # Austria Democracy Radar waves
│ ├── governance-texts/ # Governance proposal documents
│ └── voting-discussions/ # Community discussion threads
├── processed/ # Cleaned, analysis-ready data
│ ├── sentiment-labeled/ # ML-ready text data
│ ├── statistical-ready/ # Stats-formatted datasets
│ └── api-cache/ # Cached API responses
├── scripts/ # Data processing scripts
│ ├── download_data.py # Download all datasets
│ ├── process_radar.py # Process Democracy Radar
│ └── validate_data.py # Data validation
└── README.md # This file

````

## 🔐 Data Access

### Downloading Datasets
```bash
# Download all datasets
python scripts/download_data.py --all

# Download specific dataset
python scripts/download_data.py --dataset democracy-radar

# Download with authentication (if required)
python scripts/download_data.py --auth YOUR_TOKEN
````

### Data Sources

#### 1. Austria Democracy Radar

- **Source**: AUSSDA (Austrian Social Science Data Archive)
- **URL**: https://data.aussda.at/dataset.xhtml?persistentId=doi:10.11587/GCSLIN
- **Format**: CSV files per wave
- **Size**: ~50MB per wave (10 waves total)
- **License**: CC BY 4.0

#### 2. Governance Proposal Texts

- **Source**: Various governance platforms
- **Format**: JSON with text and metadata
- **Size**: ~200MB total
- **Update Frequency**: Weekly

#### 3. Voting Discussion Threads

- **Source**: Governance forums
- **Format**: JSON/CSV
- **Size**: ~100MB
- **License**: Public domain

## 📊 Data Schemas

### Democracy Radar Schema

```python
{
    'respondent_id': str,           # Unique participant ID
    'wave': int,                    # Survey wave (1-10)
    'date': datetime,               # Response date
    'trust_government': float,      # 1-10 scale
    'transparency_perception': float, # 1-10 scale
    'participation_frequency': str,  # categorical
    'demographic_age': int,         # age group
    'demographic_region': str,      # Austrian region
    'open_response': str,           # text feedback
    # ... 50+ additional columns
}
```

### Governance Text Schema

```python
{
    'proposal_id': str,             # Unique ID
    'title': str,                   # Proposal title
    'description': str,             # Full text
    'category': str,                # Governance category
    'status': str,                  # current status
    'created_date': datetime,       # submission date
    'vote_count': int,              # total votes
    'discussion_count': int,        # comments
    'tags': List[str],              # topic tags
}
```

## 🔧 Data Processing Pipeline

### 1. Raw Data Validation

```python
# scripts/validate_data.py
python scripts/validate_data.py --dataset democracy-radar-wave-1.csv
# Outputs: validation_report.json
```

### 2. Data Cleaning Process

```python
# Example: Clean Democracy Radar data
from scripts.process_radar import clean_democracy_data

df_raw = pd.read_csv('raw/democracy-radar/wave-1.csv')
df_clean = clean_democracy_data(df_raw)
df_clean.to_csv('processed/statistical-ready/wave-1-clean.csv')
```

### 3. Feature Engineering

- Text tokenization for NLP
- Sentiment labeling
- Time series formatting
- Network graph construction

## 📈 Data Quality Metrics

### Completeness

- Democracy Radar: 95%+ response rate
- Missing values documented in `data_quality_report.md`

### Accuracy

- Cross-validated with source
- Outliers flagged but retained

### Consistency

- Standardized formats across waves
- UTF-8 encoding throughout

### Timeliness

- Updated weekly for governance data
- Historical data frozen at download

## 🔄 Update Schedule

| Dataset            | Update Frequency  | Last Updated | Next Update |
| ------------------ | ----------------- | ------------ | ----------- |
| Democracy Radar    | One-time download | [Date]       | N/A         |
| Governance Texts   | Weekly            | [Date]       | [Date]      |
| Voting Discussions | Daily             | [Date]       | [Date]      |

## 🚫 Data Privacy & Ethics

### Privacy Measures

- All personal identifiers removed
- Regional data aggregated
- No individual tracking possible

### Usage Guidelines

- Research purposes only
- No commercial use without permission
- Cite original sources
- Follow GDPR compliance

### Sensitive Data Handling

```python
# Never commit these files
data/raw/personal_info.csv
data/raw/email_addresses.txt
data/processed/*_with_pii.csv
```

## 🤝 Data Sharing Across Tracks

### For Deep Learning

- Pre-tokenized text in `processed/sentiment-labeled/`
- Training/validation/test splits prepared
- Labels in separate CSV files

### For Data Science

- Cleaned numerical data in `processed/statistical-ready/`
- Aggregated metrics calculated
- Time series formatted data

### For Web Development

- API-ready JSON formats
- Paginated data files
- Cached responses for performance

### For UX Design

- Sample datasets for prototypes
- Anonymized user feedback
- Demographic summaries

## 📝 Data Documentation

### Column Descriptions

See `docs/data_dictionary.xlsx` for complete field descriptions

### Processing Logs

All processing steps logged in `logs/data_processing_YYYY-MM-DD.log`

### Version Control

- Use DVC (Data Version Control) for large files
- Git LFS for medium files (<100MB)
- External storage for very large datasets

## 🐛 Common Issues

### Issue: "File too large for Git"

```bash
# Use Git LFS
git lfs track "*.csv"
git add .gitattributes
git add large_file.csv
git commit -m "Add large dataset with LFS"
```

### Issue: "Encoding errors"

```python
# Force UTF-8 encoding
df = pd.read_csv('file.csv', encoding='utf-8-sig')
```

### Issue: "Memory error with large files"

```python
# Use chunking
for chunk in pd.read_csv('large.csv', chunksize=10000):
    process(chunk)
```

## 📊 Quick Statistics

### Dataset Sizes

- Total raw data: ~1GB
- Processed data: ~500MB
- Sample data: ~50MB

### Record Counts

- Democracy Radar responses: 50,000+
- Governance proposals: 10,000+
- Discussion threads: 25,000+

---

**Data Manager**: [Name]  
**Last Updated**: [Date]  
**Next Review**: [Date]

⚠️ **Remember**: Never commit sensitive data or API keys!
