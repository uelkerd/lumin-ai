#!/bin/bash

# LUMIN.AI Development Environment Setup Script
# This script runs automatically when your dev container is created
# It configures the environment for optimal cross-track collaboration

set -e  # Exit on any error to catch setup issues early

echo "🚀 Setting up LUMIN.AI development environment..."
echo "This process will configure your workspace for democratic governance analysis across all tracks."

# Color codes for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages to ensure security and compatibility
print_status "Updating system packages for security and compatibility..."
sudo apt-get update -y && sudo apt-get upgrade -y
print_success "System packages updated successfully"

# Create project directory structure for organized collaboration
print_status "Creating standardized project directory structure..."
mkdir -p /workspace/{data/{raw,processed,external},models/{trained,checkpoints},notebooks/{exploratory,analysis,reports},src/{deep_learning,data_science,api,web},docs,tests,scripts,configs}

# Create subdirectories for specific governance analysis workflows
mkdir -p /workspace/data/raw/{democracy_radar,oecd_trust,vienna_gov}
mkdir -p /workspace/data/processed/{sentiment_analysis,voting_patterns,trust_metrics}
mkdir -p /workspace/models/trained/{transformers,classical_ml,ensemble}
mkdir -p /workspace/notebooks/{data_exploration,model_development,visualization}
mkdir -p /workspace/src/deep_learning/{sentiment_analysis,voting_patterns,model_serving}
mkdir -p /workspace/src/data_science/{preprocessing,statistical_analysis,feature_engineering}
mkdir -p /workspace/src/api/{endpoints,models,utils}
mkdir -p /workspace/tests/{unit,integration,e2e}

print_success "Project directory structure created for organized development"

# Set up Git configuration for collaborative development
print_status "Configuring Git for team collaboration..."
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
git config --global core.safecrlf true

# Create .gitignore if it doesn't exist
if [ ! -f /workspace/.gitignore ]; then
    print_status "Creating comprehensive .gitignore for governance analysis project..."
    cat > /workspace/.gitignore << 'EOF'
# LUMIN.AI Project .gitignore
# Comprehensive ignore rules for democratic governance analysis

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Jupyter Notebook
.ipynb_checkpoints
*/.ipynb_checkpoints/*

# PyCharm
.idea/

# VS Code
.vscode/
!.vscode/extensions.json
!.vscode/launch.json
!.vscode/settings.json

# Data files (keep structure but ignore large datasets)
data/raw/*.csv
data/raw/*.xlsx
data/raw/*.json
data/processed/*.pkl
data/processed/*.csv
!data/raw/sample_*
!data/processed/sample_*

# Model files (large trained models)
models/trained/*.pt
models/trained/*.pth
models/trained/*.pkl
models/trained/*.h5
models/checkpoints/*.pt
!models/trained/sample_*

# Logs and temporary files
*.log
.DS_Store
Thumbs.db
*.tmp
*.temp

# API keys and sensitive configuration
.env.local
.env.production
config/secrets.json
*.key
*.pem

# Node.js (for web development track)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn-integrity

# Build outputs
dist/
build/
*.tgz

# Database
*.db
*.sqlite
*.sqlite3

# Documentation builds
docs/_build/
site/

# Test coverage
.coverage
htmlcov/
.pytest_cache/
.coverage.*

# Deployment
docker-compose.override.yml
Dockerfile.prod
EOF
    print_success "Comprehensive .gitignore created for multi-track development"
fi

# Initialize Git repository if not already initialized
if [ ! -d /workspace/.git ]; then
    print_status "Initializing Git repository for version control..."
    cd /workspace
    git init
    git add .gitignore
    git commit -m "feat: initialize LUMIN.AI democratic governance analysis project

- Set up development environment with multi-track support
- Created comprehensive directory structure for governance analysis
- Configured development tools for Deep Learning, Data Science, and Web Development tracks"
    print_success "Git repository initialized with initial commit"
fi

# Set up pre-commit hooks for code quality
print_status "Setting up pre-commit hooks for consistent code quality..."
cd /workspace
if [ -f .pre-commit-config.yaml ]; then
    pre-commit install
    print_success "Pre-commit hooks installed for automated code quality checks"
else
    print_warning "No pre-commit configuration found. Consider adding .pre-commit-config.yaml for better code quality."
fi

# Download sample datasets for immediate development start
print_status "Setting up sample governance datasets for development..."
mkdir -p /workspace/data/raw/samples

# Create sample Austria Democracy Radar data structure
cat > /workspace/data/raw/samples/democracy_radar_sample.csv << 'EOF'
respondent_id,wave,trust_government,trust_parliament,democratic_satisfaction,political_efficacy,year
1,1,3,2,4,3,2018
2,1,4,4,5,4,2018
3,1,2,1,2,2,2018
EOF

# Create sample governance text for sentiment analysis
cat > /workspace/data/raw/samples/governance_texts_sample.json << 'EOF'
{
  "documents": [
    {
      "id": "gov_doc_001",
      "text": "The new democratic participation initiative will enhance citizen engagement in local governance decisions.",
      "source": "municipal_policy",
      "date": "2023-01-15"
    },
    {
      "id": "gov_doc_002",
      "text": "Budget transparency measures show significant improvement in public trust metrics across all regions.",
      "source": "financial_report",
      "date": "2023-02-20"
    }
  ]
}
EOF

print_success "Sample datasets created for immediate development testing"

# Set up Jupyter notebook configuration for optimal data science workflow
print_status "Configuring Jupyter for enhanced data science experience..."
jupyter contrib nbextension install --user
jupyter nbextensions_configurator enable --user

# Enable useful extensions for governance analysis
jupyter nbextension enable --py widgetsnbextension
jupyter nbextension enable execute_time/ExecuteTime
jupyter nbextension enable varInspector/main
jupyter nbextension enable toc2/main

print_success "Jupyter extensions configured for productive data analysis"

# Create template files for quick development start
print_status "Creating development templates for rapid project start..."

# Create Deep Learning template
cat > /workspace/src/deep_learning/sentiment_analysis_template.py << 'EOF'
"""
LUMIN.AI Deep Learning Template: Governance Sentiment Analysis
Template for implementing transformer-based sentiment analysis on governance texts
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
from typing import List, Dict

class GovernanceSentimentAnalyzer:
    """
    Sentiment analyzer specifically designed for democratic governance texts
    Uses pre-trained transformers fine-tuned for political sentiment analysis
    """

    def __init__(self, model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)

    def analyze_sentiment(self, texts: List[str]) -> List[Dict]:
        """
        Analyze sentiment of governance texts
        Returns sentiment scores for democratic transparency analysis
        """
        # TODO: Implement sentiment analysis logic
        pass

    def batch_process_governance_data(self, data_path: str) -> pd.DataFrame:
        """
        Process governance documents in batch for efficiency
        Optimized for Austria Democracy Radar integration
        """
        # TODO: Implement batch processing
        pass

if __name__ == "__main__":
    # Example usage for governance analysis
    analyzer = GovernanceSentimentAnalyzer()
    sample_texts = ["Democratic participation is improving", "Budget transparency concerns persist"]
    results = analyzer.analyze_sentiment(sample_texts)
    print("Governance sentiment analysis results:", results)
EOF

# Create Data Science template
cat > /workspace/src/data_science/democracy_radar_analysis_template.py << 'EOF'
"""
LUMIN.AI Data Science Template: Austria Democracy Radar Analysis with MongoDB
Template for statistical analysis of democratic governance survey data using flexible document storage
"""

import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

class DemocracyRadarAnalyzer:
    """
    Statistical analysis toolkit for Austria Democracy Radar dataset
    Supports longitudinal analysis and cross-wave comparisons using MongoDB
    """

    def __init__(self, mongodb_uri: str = "mongodb://lumin:dummy_password@governance-db:27017/governance_analysis"): # pragma: allowlist secret
        self.mongodb_uri = mongodb_uri
        self.client = MongoClient(mongodb_uri)
        self.db = self.client.governance_analysis
        self.data = None
        self.processed_data = None

    def load_and_preprocess(self, wave_filter: Optional[List[int]] = None, region_filter: Optional[str] = None) -> pd.DataFrame:
        """
        Load Democracy Radar data from MongoDB with flexible filtering
        Handles missing values and standardizes variables across waves
        """
        # Build MongoDB query
        query = {}
        if wave_filter:
            query['wave'] = {'$in': wave_filter}
        if region_filter:
            query['demographics.region'] = region_filter

        # Retrieve data from MongoDB
        cursor = self.db.democracy_radar_responses.find(query)
        raw_data = list(cursor)

        # Convert to pandas DataFrame with flattened structure
        flattened_data = []
        for doc in raw_data:
            flat_doc = {
                'respondent_id': doc['respondent_id'],
                'wave': doc['wave'],
                'survey_year': doc['survey_year'],
                'created_at': doc['created_at']
            }

            # Flatten responses
            if 'responses' in doc:
                for key, value in doc['responses'].items():
                    flat_doc[f'response_{key}'] = value

            # Flatten demographics
            if 'demographics' in doc:
                for key, value in doc['demographics'].items():
                    flat_doc[f'demo_{key}'] = value

            flattened_data.append(flat_doc)

        self.data = pd.DataFrame(flattened_data)

        # Preprocessing steps
        if not self.data.empty:
            # Handle missing values
            trust_columns = [col for col in self.data.columns if col.startswith('response_trust')]
            self.data[trust_columns] = self.data[trust_columns].fillna(self.data[trust_columns].median())

            # Create composite trust score
            if 'response_trust_government' in self.data.columns and 'response_trust_parliament' in self.data.columns:
                self.data['trust_composite'] = (
                    self.data['response_trust_government'] + self.data['response_trust_parliament']
                ) / 2

            # Standardize numerical variables for cross-wave comparison
            scaler = StandardScaler()
            numerical_cols = self.data.select_dtypes(include=[np.number]).columns
            response_cols = [col for col in numerical_cols if col.startswith('response_')]

            if response_cols:
                self.data[f'{response_cols[0]}_standardized'] = scaler.fit_transform(self.data[response_cols[:1]])

        self.processed_data = self.data
        return self.data

    async def analyze_trust_trends(self) -> Dict:
        """
        Analyze trust in government trends across waves using MongoDB aggregation
        Leverages MongoDB's aggregation pipeline for efficient computation
        """
        # Use MongoDB aggregation for efficient trend analysis
        pipeline = [
            {
                '$group': {
                    '_id': {
                        'wave': '$wave',
                        'survey_year': '$survey_year',
                        'region': '$demographics.region'
                    },
                    'avg_trust_government': {'$avg': '$responses.trust_government'},
                    'avg_trust_parliament': {'$avg': '$responses.trust_parliament'},
                    'avg_democratic_satisfaction': {'$avg': '$responses.democratic_satisfaction'},
                    'respondent_count': {'$sum': 1},
                    'std_trust_government': {'$stdDevPop': '$responses.trust_government'}
                }
            },
            {
                '$sort': {'_id.survey_year': 1, '_id.wave': 1}
            }
        ]

        # Execute aggregation
        results = list(self.db.democracy_radar_responses.aggregate(pipeline))

        # Convert to DataFrame for analysis
        trends_df = pd.DataFrame([
            {
                'wave': r['_id']['wave'],
                'survey_year': r['_id']['survey_year'],
                'region': r['_id']['region'],
                'avg_trust_government': r['avg_trust_government'],
                'avg_trust_parliament': r['avg_trust_parliament'],
                'avg_democratic_satisfaction': r['avg_democratic_satisfaction'],
                'respondent_count': r['respondent_count'],
                'std_trust_government': r['std_trust_government']
            }
            for r in results
        ])

        # Calculate trend statistics
        trend_analysis = {}
        for region in trends_df['region'].unique():
            region_data = trends_df[trends_df['region'] == region]
            if len(region_data) > 1:
                # Calculate correlation with time
                correlation = stats.pearsonr(region_data['wave'], region_data['avg_trust_government'])

                trend_analysis[region] = {
                    'correlation_with_time': correlation[0],
                    'trend_significance': correlation[1],
                    'overall_trend': 'increasing' if correlation[0] > 0 else 'decreasing',
                    'mean_trust': region_data['avg_trust_government'].mean(),
                    'trust_volatility': region_data['avg_trust_government'].std()
                }

        return {
            'regional_trends': trend_analysis,
            'overall_data': trends_df.to_dict('records'),
            'analysis_date': datetime.now().isoformat()
        }

    def correlation_analysis(self) -> np.ndarray:
        """
        Analyze correlations between democratic attitudes
        Identifies key relationships in governance perceptions
        """
        if self.processed_data is None:
            self.load_and_preprocess()

        # Select response variables for correlation analysis
        response_cols = [col for col in self.processed_data.columns if col.startswith('response_')]

        if not response_cols:
            print("No response variables found for correlation analysis")
            return np.array([])

        # Calculate correlation matrix
        correlation_matrix = self.processed_data[response_cols].corr()

        # Create visualization
        plt.figure(figsize=(12, 10))
        sns.heatmap(
            correlation_matrix,
            annot=True,
            cmap='RdYlBu_r',
            center=0,
            square=True,
            fmt='.2f'
        )
        plt.title('Democratic Attitudes Correlation Matrix\nAustria Democracy Radar Analysis')
        plt.tight_layout()
        plt.show()

        return correlation_matrix.values

    def save_analysis_to_mongodb(self, analysis_results: Dict, analysis_type: str):
        """
        Save analysis results back to MongoDB for cross-track integration
        Enables sharing results with Deep Learning and Web Development tracks
        """
        # Prepare document for MongoDB storage
        analysis_doc = {
            'analysis_id': f"{analysis_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'analysis_type': analysis_type,
            'analysis_results': analysis_results,
            'metadata': {
                'analyzer_version': '1.0.0',
                'data_source': 'austria_democracy_radar',
                'analysis_date': datetime.now(),
                'sample_size': len(self.processed_data) if self.processed_data is not None else 0
            },
            'statistical_summary': {
                'variables_analyzed': list(analysis_results.keys()) if isinstance(analysis_results, dict) else [],
                'significance_threshold': 0.05,
                'confidence_level': 0.95
            }
        }

        # Insert into governance_metrics collection
        result = self.db.governance_metrics.insert_one(analysis_doc)

        print(f"Analysis results saved to MongoDB with ID: {result.inserted_id}")
        return result.inserted_id

if __name__ == "__main__":
    # Example usage for Democracy Radar analysis with MongoDB
    analyzer = DemocracyRadarAnalyzer()

    # Load and preprocess data
    data = analyzer.load_and_preprocess(wave_filter=[1, 2, 3], region_filter="Vienna")
    print(f"Loaded {len(data)} survey responses")

    # Analyze trust trends
    trends = asyncio.run(analyzer.analyze_trust_trends())
    print("Trust trend analysis completed")

    # Perform correlation analysis
    correlation_matrix = analyzer.correlation_analysis()
    print("Correlation analysis completed")

    # Save results for cross-track integration
    if trends:
        analyzer.save_analysis_to_mongodb(trends, 'trust_trends_analysis')

    print("Democratic governance analysis completed successfully")
EOF

# Create API template for cross-track integration
cat > /workspace/src/api/governance_api_template.py << 'EOF'
"""
LUMIN.AI API Template: Governance Analysis API with MongoDB
FastAPI service for integrating ML models with multimodal governance data
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import gridfs
from datetime import datetime, timedelta
import json

app = FastAPI(
    title="LUMIN.AI Governance Analysis API",
    description="API for democratic transparency and multimodal governance analysis",
    version="1.0.0"
)

# MongoDB connection
MONGODB_URI = "mongodb://lumin:dummy_password@governance-db:27017/governance_analysis" # pragma: allowlist secret
client = AsyncIOMotorClient(MONGODB_URI)
db = client.governance_analysis

class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class GovernanceTextRequest(BaseModel):
    """Request model for governance text analysis"""
    texts: List[str]
    analysis_type: str = "sentiment"
    include_embeddings: bool = False

class MultimodalAnalysisRequest(BaseModel):
    """Request model for multimodal governance analysis"""
    document_id: str
    analysis_types: List[str] = ["sentiment", "entity_extraction", "topic_modeling"]
    include_audio_transcription: bool = False
    include_image_analysis: bool = False

class AnalysisResponse(BaseModel):
    """Response model for governance analysis results"""
    results: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    processing_time_ms: Optional[int] = None

class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    document_id: str
    processing_status: Dict[str, bool]
    upload_timestamp: datetime

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test MongoDB connection
        await db.command("ping")
        return {"status": "healthy", "service": "governance-analysis", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.post("/analyze/sentiment", response_model=AnalysisResponse)
async def analyze_sentiment(request: GovernanceTextRequest):
    """
    Analyze sentiment of governance texts using transformer models
    Integrates Deep Learning track sentiment analysis with multimodal data storage
    """
    start_time = datetime.now()

    try:
        results = []
        for text in request.texts:
            # TODO: Integrate with actual sentiment analysis model
            # This is where Deep Learning track's sentiment model would be called
            sentiment_result = {
                "text": text[:100] + "..." if len(text) > 100 else text,
                "sentiment_label": "positive",  # Placeholder
                "confidence_scores": {
                    "positive": 0.85,
                    "negative": 0.10,
                    "neutral": 0.05
                },
                "confidence": 0.85
            }

            if request.include_embeddings:
                # TODO: Add actual embedding generation
                sentiment_result["embeddings"] = [0.1] * 384  # Placeholder

            results.append(sentiment_result)

        # Cache results in MongoDB
        cache_doc = {
            "cache_key": f"sentiment_{hash(str(request.texts))}",
            "endpoint": "/analyze/sentiment",
            "request_parameters": request.dict(),
            "response_data": results,
            "created_at": datetime.now(),
            "expires_at": datetime.now() + timedelta(hours=1)
        }
        await db.api_cache.insert_one(cache_doc)

        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        return AnalysisResponse(
            results=results,
            metadata={
                "model_version": "governance-sentiment-v1.2",
                "processed_count": len(request.texts),
                "cache_status": "stored"
            },
            processing_time_ms=int(processing_time)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@app.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_governance_document(
    file: UploadFile = File(...),
    document_type: str = "policy_document",
    source_organization: str = "Unknown"
):
    """
    Upload multimodal governance documents with automatic processing pipeline
    Supports text, PDF, images, audio, and video content
    """
    try:
        # Generate unique document ID
        document_id = f"DOC_{ObjectId()}"

        # Read file content
        content = await file.read()

        # Store file in GridFS for large files
        fs = gridfs.GridFSBucket(db.db, bucket_name='governance_files')
        file_id = await fs.upload_from_stream(
            filename=file.filename,
            source=content
        )

        # Determine content type and processing requirements
        content_type = file.content_type or "application/octet-stream"

        # Create document metadata
        document_doc = {
            "document_id": document_id,
            "title": file.filename,
            "file_metadata": {
                "original_filename": file.filename,
                "content_type": content_type,
                "file_size_bytes": len(content),
                "gridfs_file_id": str(file_id)
            },
            "multimodal_content": {
                "has_images": content_type.startswith("image/"),
                "has_audio": content_type.startswith("audio/"),
                "has_video": content_type.startswith("video/"),
                "has_pdf": content_type == "application/pdf"
            },
            "document_metadata": {
                "document_type": document_type,
                "source_organization": source_organization,
                "upload_date": datetime.now(),
                "classification": "public"
            },
            "processing_status": {
                "text_processed": False,
                "sentiment_analyzed": False,
                "topic_modeled": False,
                "entity_extraction": False,
                "image_analyzed": False,
                "audio_transcribed": False,
                "video_analyzed": False
            },
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Insert document into MongoDB
        result = await db.governance_documents.insert_one(document_doc)

        # TODO: Trigger async processing pipeline
        # This would start the multimodal analysis pipeline

        return DocumentUploadResponse(
            document_id=document_id,
            processing_status=document_doc["processing_status"],
            upload_timestamp=document_doc["created_at"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document upload failed: {str(e)}")

@app.get("/data/democracy-radar/summary")
async def get_democracy_radar_summary(
    region: Optional[str] = None,
    wave: Optional[int] = None,
    metric: str = "trust_government"
):
    """
    Get summary statistics from Democracy Radar analysis
    Integrates Data Science track analysis with flexible MongoDB queries
    """
    try:
        # Build aggregation pipeline
        pipeline = []

        # Match stage for filtering
        match_stage = {}
        if region:
            match_stage["demographics.region"] = region
        if wave:
            match_stage["wave"] = wave

        if match_stage:
            pipeline.append({"$match": match_stage})

        # Group stage for aggregation
        group_stage = {
            "$group": {
                "_id": {
                    "region": "$demographics.region",
                    "wave": "$wave"
                },
                "respondent_count": {"$sum": 1},
                f"avg_{metric}": {"$avg": f"$responses.{metric}"},
                f"std_{metric}": {"$stdDevPop": f"$responses.{metric}"},
                "latest_survey_year": {"$max": "$survey_year"}
            }
        }
        pipeline.append(group_stage)

        # Sort stage
        pipeline.append({"$sort": {"_id.wave": -1, "_id.region": 1}})

        # Execute aggregation
        cursor = db.democracy_radar_responses.aggregate(pipeline)
        results = await cursor.to_list(length=None)

        # Calculate overall summary
        total_responses = sum(r["respondent_count"] for r in results)
        avg_metric_overall = sum(r[f"avg_{metric}"] * r["respondent_count"] for r in results) / total_responses if total_responses > 0 else 0

        return {
            "metric": metric,
            "region_filter": region,
            "wave_filter": wave,
            "overall_average": round(avg_metric_overall, 2),
            "total_responses": total_responses,
            "regional_breakdown": [
                {
                    "region": r["_id"]["region"],
                    "wave": r["_id"]["wave"],
                    "average": round(r[f"avg_{metric}"], 2),
                    "std_deviation": round(r[f"std_{metric}"], 2),
                    "sample_size": r["respondent_count"]
                }
                for r in results
            ],
            "latest_wave": max(r["_id"]["wave"] for r in results) if results else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Democracy Radar summary failed: {str(e)}")

@app.get("/documents/{document_id}/analysis")
async def get_document_analysis(document_id: str):
    """
    Retrieve comprehensive analysis results for a governance document
    Includes sentiment, entity extraction, and multimodal analysis results
    """
    try:
        # Find document in MongoDB
        document = await db.governance_documents.find_one({"document_id": document_id})

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Return analysis results
        return {
            "document_id": document_id,
            "title": document.get("title"),
            "document_type": document.get("document_metadata", {}).get("document_type"),
            "processing_status": document.get("processing_status", {}),
            "ml_analysis": document.get("ml_analysis", {}),
            "multimodal_content": document.get("multimodal_content", {}),
            "engagement_metrics": document.get("engagement_metrics", {}),
            "last_updated": document.get("updated_at")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analysis retrieval failed: {str(e)}")

@app.get("/metrics/trends")
async def get_governance_trends(
    metric_type: str = "trust_analysis",
    time_period: str = "quarterly",
    region: Optional[str] = None
):
    """
    Get governance trend analysis for dashboard visualization
    Supports various time periods and geographic scopes
    """
    try:
        # Build query for governance metrics
        query = {"metric_type": metric_type}
        if region:
            query["geographic_scope.regions"] = region

        # Find relevant metrics
        cursor = db.governance_metrics.find(query).sort("time_period.start_date", -1).limit(10)
        metrics = await cursor.to_list(length=None)

        # Format for dashboard consumption
        trends = []
        for metric in metrics:
            trends.append({
                "period": f"{metric['time_period']['start_date'].strftime('%Y-%m')} to {metric['time_period']['end_date'].strftime('%Y-%m')}",
                "values": metric.get("metrics", {}),
                "trend_direction": metric.get("trend_analysis", {}).get("direction"),
                "confidence_intervals": metric.get("confidence_intervals", {}),
                "sample_size": metric.get("sample_statistics", {}).get("total_responses")
            })

        return {
            "metric_type": metric_type,
            "time_period": time_period,
            "region_filter": region,
            "trends": trends,
            "data_points": len(trends)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
EOF

print_success "Development templates created for rapid cross-track development"

# Set proper permissions for development workflow
print_status "Setting proper file permissions for collaborative development..."
sudo chown -R lumin-dev:lumin-dev /workspace
chmod -R 755 /workspace
chmod +x /workspace/src/api/*.py

print_success "File permissions configured for team collaboration"

# Create helpful development scripts
print_status "Creating development utility scripts..."
mkdir -p /workspace/scripts

cat > /workspace/scripts/start_jupyter.sh << 'EOF'
#!/bin/bash
# Start Jupyter Lab for data science workflows
echo "Starting Jupyter Lab for LUMIN.AI governance analysis..."
cd /workspace
jupyter lab --allow-root --ip=0.0.0.0 --port=8888 --no-browser
EOF

cat > /workspace/scripts/start_api.sh << 'EOF'
#!/bin/bash
# Start API server for cross-track integration
echo "Starting LUMIN.AI Governance Analysis API..."
cd /workspace/src/api
python governance_api_template.py
EOF

cat > /workspace/scripts/run_tests.sh << 'EOF'
#!/bin/bash
# Run comprehensive test suite
echo "Running LUMIN.AI test suite..."
cd /workspace
python -m pytest tests/ -v --cov=src --cov-report=html
EOF

chmod +x /workspace/scripts/*.sh
print_success "Development utility scripts created and made executable"

# Install Node.js dependencies for web development track
if [ -f /workspace/web/package.json ]; then
    print_status "Installing Node.js dependencies for web development..."
    cd /workspace/web
    npm install
    print_success "Node.js dependencies installed successfully"
else
    print_status "Creating basic package.json for web development track..."
    mkdir -p /workspace/web
    cat > /workspace/web/package.json << 'EOF'
{
  "name": "lumin-ai-dashboard",
  "version": "1.0.0",
  "description": "Democratic governance analysis dashboard",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^4.9.0",
    "tailwindcss": "^3.3.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "axios": "^1.6.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF
    cd /workspace/web
    npm install
    print_success "Web development environment initialized"
fi

# Final setup verification
print_status "Verifying development environment setup..."

# Check Python environment
python --version
pip list | grep -E "(torch|pandas|fastapi)" || print_warning "Some Python packages may not be installed correctly"

# Check Node.js environment
node --version
npm --version

# Check database connectivity
mongosh --eval "db.adminCommand('ping')" mongodb://lumin:dummy_password@governance-db:27017/governance_analysis && print_success "MongoDB connection verified" || print_warning "MongoDB may not be ready yet" # pragma: allowlist secret

# Create README for development environment
cat > /workspace/DEVELOPMENT.md << 'EOF'
# LUMIN.AI Development Environment

This development environment is configured for comprehensive democratic governance analysis with multimodal data support across multiple tracks.

## Quick Start

1. **Start Jupyter Lab**: `./scripts/start_jupyter.sh`
2. **Start API Server**: `./scripts/start_api.sh`
3. **Start Web Dashboard**: `cd web && npm start`
4. **Run Tests**: `./scripts/run_tests.sh`

## Database: MongoDB for Multimodal Governance Data

The development environment uses MongoDB for flexible document storage, supporting:
- **Text**: Governance documents, survey responses, policy texts
- **Images**: Infographics, policy diagrams, visualization outputs
- **Audio**: Speech transcriptions, public hearing recordings
- **Video**: Governance presentations, citizen engagement sessions
- **Complex ML Outputs**: Embeddings, model predictions, analysis results

### MongoDB Collections

- `democracy_radar_responses`: Austria Democracy Radar survey data with flexible schema
- `governance_documents`: Multimodal governance documents with ML analysis results
- `ml_model_results`: Deep Learning model outputs and training metrics
- `governance_metrics`: Aggregated analytics for dashboard visualization
- `blockchain_governance`: Blockchain governance data with flexible structure
- `user_interactions`: UX analytics and user behavior tracking
- `api_cache`: Performance optimization with TTL expiration

### Connecting to MongoDB

```python
from pymongo import MongoClient
client = MongoClient("mongodb://lumin:dummy_password@governance-db:27017/governance_analysis") # pragma: allowlist secret
db = client.governance_analysis

# Example: Query survey responses
responses = db.democracy_radar_responses.find({"wave": 1})
```

## Directory Structure

- `data/`: Governance datasets (Austria Democracy Radar, OECD Trust, Vienna Gov)
  - `raw/`: Original datasets and multimodal files
  - `processed/`: Cleaned and analyzed data
  - `external/`: Third-party governance data sources
- `models/`: Trained ML models and checkpoints
- `notebooks/`: Jupyter notebooks for analysis and exploration
- `src/`: Source code organized by track
  - `deep_learning/`: Sentiment analysis, multimodal ML models
  - `data_science/`: Statistical analysis, trend modeling
  - `api/`: FastAPI services for cross-track integration
  - `web/`: React dashboard and visualization components
- `tests/`: Comprehensive test suite
- `scripts/`: Development utility scripts

## Cross-Track Integration

The development environment supports seamless integration between:
- **Deep Learning**: Sentiment analysis → MongoDB storage → API endpoints
- **Data Science**: Statistical analysis → MongoDB aggregation → Dashboard visualizations
- **Web Development**: Dashboard → MongoDB queries → Real-time multimodal data display
- **UX Design**: User interactions → MongoDB analytics → Behavior insights

### Multimodal Data Pipeline

1. **Upload**: Documents (PDF, images, audio, video) → GridFS storage
2. **Processing**: ML analysis → Results stored in MongoDB documents
3. **Integration**: Cross-track access through unified MongoDB schema
4. **Visualization**: Dashboard consumes multimodal analysis results

## Development Workflow

### Working with Survey Data
```python
from src.data_science.democracy_radar_analysis_template import DemocracyRadarAnalyzer
analyzer = DemocracyRadarAnalyzer()
data = analyzer.load_and_preprocess(wave_filter=[1, 2, 3])
trends = await analyzer.analyze_trust_trends()
```

### Working with Governance Documents
```python
from pymongo import MongoClient
client = MongoClient("mongodb://lumin:dummy_password@governance-db:27017/governance_analysis") # pragma: allowlist secret
db = client.governance_analysis

# Find documents with high positive sentiment
docs = db.governance_documents.find({
    "ml_analysis.sentiment_scores.positive": {"$gte": 0.8},
    "multimodal_content.has_images": True
})
```

### API Integration
```bash
# Start the governance analysis API
cd /workspace/src/api
python governance_api_template.py

# Test multimodal document upload
curl -X POST "http://localhost:8000/documents/upload" \
     -F "file=@governance_document.pdf" \
     -F "document_type=policy_document"
```

## Getting Help

- Check `/workspace/docs/` for detailed documentation
- Review template files in `/workspace/src/` for implementation examples
- Use the pre-configured Jupyter extensions for enhanced data science workflow
- MongoDB Compass can be used for visual database exploration
- Check MongoDB logs: `docker logs lumin-governance-db`

## Performance Optimization

- **Indexes**: Optimized for governance analysis queries
- **GridFS**: Efficient storage for large multimodal files
- **Aggregation Pipelines**: Pre-computed views for dashboard performance
- **Caching**: Redis + MongoDB TTL for API response optimization
- **Change Streams**: Real-time updates for collaborative analysis

## Data Quality and Validation

- Schema validation ensures data consistency
- Automated data quality checks in preprocessing pipelines
- Missing data handling strategies for survey analysis
- Multimodal content verification and metadata extraction
EOF

print_success "Development environment documentation created"

echo ""
echo "🎉 LUMIN.AI development environment setup completed successfully!"
echo ""
echo "Your workspace is now configured for democratic governance analysis with:"
echo "  ✅ Deep Learning tools for sentiment analysis"
echo "  ✅ Data Science libraries for statistical analysis"
echo "  ✅ Web development framework for dashboard creation"
echo "  ✅ API integration for cross-track collaboration"
echo "  ✅ Sample datasets for immediate development"
echo "  ✅ Development templates and utility scripts"
echo ""
echo "Next steps:"
echo "  1. Open Jupyter Lab: ./scripts/start_jupyter.sh"
echo "  2. Explore the sample data in /workspace/data/raw/samples/"
echo "  3. Review the template files in /workspace/src/"
echo "  4. Start building your democratic governance analysis!"
echo ""
print_success "Happy coding! 🚀"
