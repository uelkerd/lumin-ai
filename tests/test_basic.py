"""Basic tests for the LUMIN.AI project."""


def test_truth():
    """Test that True is indeed True."""
    assert True


def test_math():
    """Test that basic arithmetic works."""
    assert 2 + 2 == 4
    assert 10 - 5 == 5
    assert 3 * 4 == 12
    assert 10 / 2 == 5


def test_string_operations():
    """Test that string operations work correctly."""
    # String concatenation
    assert "Hello, " + "World!" == "Hello, World!"

    # String methods
    assert "hello".upper() == "HELLO"
    assert "WORLD".lower() == "world"
    assert "   strip me   ".strip() == "strip me"
    assert "count letters".count("t") == 3
