"""Tests for the utils module."""

# Third-party imports
import pytest

# Project imports
from lumin_ai.utils import add, divide, multiply, subtract


def test_add() -> None:
    """Test the add function."""
    assert add(2, 2) == 4
    assert add(0, 0) == 0
    assert add(-1, 1) == 0
    assert add(0.1, 0.2) == pytest.approx(0.3)


def test_subtract() -> None:
    """Test the subtract function."""
    assert subtract(3, 2) == 1
    assert subtract(1, 1) == 0
    assert subtract(0, 5) == -5
    assert subtract(10.5, 5.5) == 5.0


def test_multiply() -> None:
    """Test the multiply function."""
    assert multiply(2, 3) == 6
    assert multiply(0, 100) == 0
    assert multiply(-2, 3) == -6
    assert multiply(-2, -3) == 6
    assert multiply(1.5, 2) == 3.0


def test_divide() -> None:
    """Test the divide function."""
    assert divide(6, 3) == 2
    assert divide(5, 2) == 2.5
    assert divide(0, 1) == 0
    assert divide(-6, 2) == -3
    assert divide(-6, -2) == 3


def test_divide_by_zero() -> None:
    """Test division by zero raises an exception."""
    with pytest.raises(ZeroDivisionError):
        divide(5, 0)
