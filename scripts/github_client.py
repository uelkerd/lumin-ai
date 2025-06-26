#!/usr/bin/env python3
"""A centralized GitHub API client to handle REST and GraphQL requests."""

import logging
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)


class GitHubClient:
    """A client for interacting with the GitHub REST and GraphQL APIs."""

    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self._rest_base_url = f"https://api.github.com/repos/{owner}/{repo}"
        self._graphql_url = "https://api.github.com/graphql"
        self._headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }

    def post_graphql(self, query: str) -> Dict[str, Any]:
        """
        Execute a GraphQL query.

        Args:
            query: The GraphQL query string.

        Returns:
            The JSON response from the API as a dictionary.
        """
        logger.debug(f"Executing GraphQL query:\n{query}")
        try:
            response = requests.post(
                self._graphql_url, json={"query": query}, headers=self._headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GraphQL request failed: {e}")
            logger.error(f"Response body: {e.response.text if e.response else 'No response'}")
            return {}

    def get_rest(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """
        Make a GET request to the GitHub REST API.

        Args:
            endpoint: The API endpoint (e.g., "/issues").
            params: Optional dictionary of query parameters.

        Returns:
            The JSON response from the API.
        """
        url = f"{self._rest_base_url}{endpoint}"
        logger.debug(f"Making GET request to {url} with params: {params}")
        try:
            response = requests.get(url, headers=self._headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GET request to {url} failed: {e}")
            return None

    def post_rest(self, endpoint: str, json_data: Dict[str, Any]) -> Any:
        """
        Make a POST request to the GitHub REST API.

        Args:
            endpoint: The API endpoint (e.g., "/issues").
            json_data: The JSON payload to send.

        Returns:
            The JSON response from the API.
        """
        url = f"{self._rest_base_url}{endpoint}"
        logger.debug(f"Making POST request to {url}")
        try:
            response = requests.post(url, json=json_data, headers=self._headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"POST request to {url} failed: {e}")
            logger.error(f"Response body: {e.response.text if e.response else 'No response'}")
            return None
