"""Tests for the utils module."""

import pytest

from lumin_ai.utils import add, divide, multiply, subtract


def test_add():
    """Test the add function."""
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0
    assert add(1.5, 2.5) == 4.0


def test_subtract():
    """Test the subtract function."""
    assert subtract(3, 2) == 1
    assert subtract(1, 1) == 0
    assert subtract(0, 5) == -5
    assert subtract(10.5, 5.5) == 5.0


def test_multiply():
    """Test the multiply function."""
    assert multiply(2, 3) == 6
    assert multiply(0, 100) == 0
    assert multiply(-2, 3) == -6
    assert multiply(-2, -3) == 6
    assert multiply(1.5, 2) == 3.0


def test_divide():
    """Test the divide function."""
    assert divide(6, 3) == 2
    assert divide(5, 2) == 2.5
    assert divide(0, 1) == 0
    assert divide(-6, 2) == -3
    assert divide(-6, -2) == 3


def test_divide_by_zero():
    """Test division by zero raises an exception."""
    with pytest.raises(ZeroDivisionError):
        divide(5, 0)
