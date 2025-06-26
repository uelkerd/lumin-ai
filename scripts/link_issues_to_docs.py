#!/usr/bin/env python3
"""
Link existing GitHub issues back to specific sections in PRD/MVP documents
"""
import argparse
import logging
import os
import re
import sys
from typing import Dict, List, Optional, Set, Tuple

# Add the parent directory to the path so we can import github_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.github_client import GitHubClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def index_markdown_documents(docs_dir: str) -> Dict[str, Dict]:
    """
    Create an index of all markdown headings in the docs directory
    
    Args:
        docs_dir: Path to the documentation directory
        
    Returns:
        Dictionary mapping keywords to document references
    """
    logger.info(f"Indexing markdown documents in {docs_dir}")
    
    if not os.path.isdir(docs_dir):
        raise FileNotFoundError(f"Documentation directory not found: {docs_dir}")
    
    keyword_index = {}
    
    # Find all markdown files
    markdown_files = []
    for root, _, files in os.walk(docs_dir):
        for file in files:
            if file.endswith(".md"):
                markdown_files.append(os.path.join(root, file))
    
    logger.info(f"Found {len(markdown_files)} markdown files")
    
    # Parse each file for headings and content
    for md_file in markdown_files:
        rel_path = os.path.relpath(md_file, start=os.path.dirname(docs_dir))
        file_name = os.path.basename(md_file)
        
        try:
            with open(md_file, 'r') as f:
                content = f.read()
            
            # Find all headings with their content
            heading_pattern = r'(#+)\s+(.+?)\n((?:(?!#).)+)'
            matches = re.finditer(heading_pattern, content, re.DOTALL)
            
            for match in matches:
                heading_level = len(match.group(1))
                heading_text = match.group(2).strip()
                heading_content = match.group(3).strip()
                
                # Extract keywords from heading and content
                keywords = extract_keywords(heading_text, heading_content)
                
                # Calculate position in the file (line number)
                position = content[:match.start()].count('\n') + 1
                
                # Create a reference to this document section
                doc_ref = {
                    'file': rel_path,
                    'heading': heading_text,
                    'level': heading_level,
                    'position': position,
                    'url': f"https://github.com/uelkerd/lumin-ai/blob/main/{rel_path}#L{position}"
                }
                
                # Add to keyword index
                for keyword in keywords:
                    if keyword not in keyword_index:
                        keyword_index[keyword] = []
                    keyword_index[keyword].append(doc_ref)
            
            logger.info(f"Indexed headings in {file_name}")
            
        except Exception as e:
            logger.error(f"Error indexing {file_name}: {e}")
            continue
    
    logger.info(f"Created index with {len(keyword_index)} keywords")
    return keyword_index


def extract_keywords(heading: str, content: str) -> Set[str]:
    """Extract important keywords from heading and content"""
    # Combine heading and first sentence of content
    first_sentence = content.split('.')[0] if '.' in content else content
    combined_text = f"{heading} {first_sentence}"
    
    # Remove common stopwords and punctuation
    stopwords = {'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
                'at', 'from', 'by', 'for', 'with', 'about', 'to', 'in', 'on'}
    
    words = re.findall(r'\w+', combined_text.lower())
    keywords = {word for word in words if word not in stopwords and len(word) > 2}
    
    # Add the full heading as a keyword phrase
    keyword_phrase = re.sub(r'[^\w\s]', '', heading.lower())
    keywords.add(keyword_phrase)
    
    return keywords


def find_matching_docs(issue_title: str, issue_body: str, keyword_index: Dict) -> List[Dict]:
    """Find matching document sections for an issue based on its title and body"""
    # Extract keywords from issue
    issue_keywords = extract_keywords(issue_title, issue_body)
    
    # Find matching documents
    matching_docs = {}
    match_scores = {}
    
    for keyword in issue_keywords:
        if keyword in keyword_index:
            for doc_ref in keyword_index[keyword]:
                doc_id = f"{doc_ref['file']}#{doc_ref['position']}"
                if doc_id not in matching_docs:
                    matching_docs[doc_id] = doc_ref
                    match_scores[doc_id] = 0
                match_scores[doc_id] += 1
    
    # Sort by match score
    sorted_matches = sorted(
        matching_docs.values(),
        key=lambda x: match_scores[f"{x['file']}#{x['position']}"],
        reverse=True
    )
    
    return sorted_matches[:3]  # Return top 3 matches


def update_issues_with_doc_links(
    client: GitHubClient, 
    keyword_index: Dict, 
    dry_run: bool = False,
    query: str = "is:open is:issue no:projectcard"  # Default to issues not in any project
) -> int:
    """
    Update GitHub issues with links to relevant documentation sections
    
    Args:
        client: GitHub client
        keyword_index: Dictionary mapping keywords to document references
        dry_run: If True, only log actions without making changes
        query: GitHub search query to filter issues
        
    Returns:
        Number of issues updated
    """
    logger.info(f"Searching for issues matching query: {query}")
    
    # Get issues using the GitHub search API
    search_query = f"repo:{client.owner}/{client.repo} {query}"
    issues = client.get_rest("/search/issues", {"q": search_query})
    
    if not issues or "items" not in issues:
        logger.warning("No issues found")
        return 0
    
    logger.info(f"Found {len(issues['items'])} issues")
    
    updated_count = 0
    
    for issue in issues["items"]:
        issue_url = issue["url"]
        issue_number = issue["number"]
        issue_title = issue["title"]
        issue_body = issue["body"] or ""
        
        logger.info(f"Processing issue #{issue_number}: {issue_title}")
        
        # Find matching documentation sections
        matching_docs = find_matching_docs(issue_title, issue_body, keyword_index)
        
        if not matching_docs:
            logger.info(f"No matching docs found for issue #{issue_number}")
            continue
        
        # Create comment with links to relevant documentation
        comment_body = "## Related Documentation\n\n"
        comment_body += "I've identified these sections in our documentation that may be related to this issue:\n\n"
        
        for i, doc in enumerate(matching_docs, 1):
            comment_body += f"{i}. **[{doc['heading']}]({doc['url']})** in [{os.path.basename(doc['file'])}]({doc['url']})\n"
        
        comment_body += "\n---\n*This comment was automatically generated by the `link_issues_to_docs.py` script.*"
        
        if dry_run:
            logger.info(f"DRY RUN: Would add doc links to issue #{issue_number}")
            logger.info(f"Comment body: {comment_body}")
            continue
        
        # Post comment to the issue
        response = client.post_rest(f"/issues/{issue_number}/comments", {"body": comment_body})
        
        if response:
            logger.info(f"✅ Added doc links to issue #{issue_number}")
            updated_count += 1
        else:
            logger.error(f"❌ Failed to add doc links to issue #{issue_number}")
    
    return updated_count


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Link GitHub issues to documentation sections")
    parser.add_argument(
        "docs_dir", 
        help="Path to documentation directory"
    )
    parser.add_argument(
        "--token", 
        required=True, 
        help="GitHub personal access token"
    )
    parser.add_argument(
        "--owner", 
        default="uelkerd", 
        help="Repository owner (default: uelkerd)"
    )
    parser.add_argument(
        "--repo", 
        default="lumin-ai", 
        help="Repository name (default: lumin-ai)"
    )
    parser.add_argument(
        "--query",
        default="is:open is:issue no:projectcard",
        help="GitHub search query to filter issues (default: issues without project cards)"
    )
    parser.add_argument(
        "--dry-run", 
        action="store_true", 
        help="Preview changes without updating issues"
    )
    
    args = parser.parse_args()
    
    # Initialize GitHub client
    client = GitHubClient(args.token, args.owner, args.repo)
    
    try:
        # Index documentation files
        keyword_index = index_markdown_documents(args.docs_dir)
        
        # Update issues with documentation links
        if not args.dry_run:
            updated_count = update_issues_with_doc_links(
                client, keyword_index, args.dry_run, args.query
            )
            logger.info(f"Updated {updated_count} issues with documentation links")
        else:
            logger.info(f"DRY RUN: Would process issues matching: {args.query}")
            update_issues_with_doc_links(client, keyword_index, args.dry_run, args.query)
            
    except FileNotFoundError as e:
        logger.error(e)
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
