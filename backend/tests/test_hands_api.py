import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Poker API is running"}


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_hand_complete_poker_hand():
    """Test creating a complete poker hand with validation"""
    hand_data = {
        "bb_size": 40,
        "seats": [
            {"seat": 0, "name": "Player0", "starting_stack": 1000, "role": "BTN"},
            {"seat": 1, "name": "Player1", "starting_stack": 1000, "role": "SB"},
            {"seat": 2, "name": "Player2", "starting_stack": 1000, "role": "BB"},
            {"seat": 3, "name": "Player3", "starting_stack": 1000, "role": "UTG"},
            {"seat": 4, "name": "Player4", "starting_stack": 1000, "role": "MP"},
            {"seat": 5, "name": "Player5", "starting_stack": 1000, "role": "CO"},
        ],
        "hole_cards": {
            0: "As Ks",
            1: "Qd Jd", 
            2: "Tc 9c",
            3: "8h 7h",
            4: "6s 5s",
            5: "4d 3d"
        },
        "board": {
            "flop": "Ac Kh Qc",
            "turn": "Js",
            "river": "Td"
        },
        "actions": [
            {"seat": 3, "street": "preflop", "type": "r", "amount": 120},
            {"seat": 4, "street": "preflop", "type": "f", "amount": 0},
            {"seat": 5, "street": "preflop", "type": "f", "amount": 0},
            {"seat": 0, "street": "preflop", "type": "f", "amount": 0},
            {"seat": 1, "street": "preflop", "type": "f", "amount": 0},
            {"seat": 2, "street": "preflop", "type": "c", "amount": 80},
            {"seat": 3, "street": "flop", "type": "b", "amount": 80},
            {"seat": 2, "street": "flop", "type": "c", "amount": 80},
            {"seat": 3, "street": "turn", "type": "x", "amount": 0},
            {"seat": 2, "street": "turn", "type": "b", "amount": 160},
            {"seat": 3, "street": "turn", "type": "c", "amount": 160},
            {"seat": 2, "street": "river", "type": "x", "amount": 0},
            {"seat": 3, "street": "river", "type": "x", "amount": 0},
        ]
    }
    
    response = client.post("/api/hands", json=hand_data)
    assert response.status_code == 201
    
    data = response.json()
    assert "id" in data
    assert "result" in data
    assert "short_line" in data
    
    # Verify result sums to 0 (conservation of chips)
    total_winnings = sum(data["result"].values())
    assert total_winnings == 0
    
    # Verify short line contains expected elements
    short_line = data["short_line"]
    assert "Seat3:raise120" in short_line
    assert "Seat2:call" in short_line
    assert "Flop:Ac Kh Qc" in short_line
    assert "Turn:Js" in short_line
    assert "River:Td" in short_line


def test_create_hand_invalid_roles():
    """Test creating a hand with invalid roles"""
    hand_data = {
        "bb_size": 40,
        "seats": [
            {"seat": 0, "name": "Player0", "starting_stack": 1000, "role": "INVALID"},
            {"seat": 1, "name": "Player1", "starting_stack": 1000, "role": "SB"},
            {"seat": 2, "name": "Player2", "starting_stack": 1000, "role": "BB"},
            {"seat": 3, "name": "Player3", "starting_stack": 1000, "role": "UTG"},
            {"seat": 4, "name": "Player4", "starting_stack": 1000, "role": "MP"},
            {"seat": 5, "name": "Player5", "starting_stack": 1000, "role": "CO"},
        ],
        "hole_cards": {},
        "board": {},
        "actions": []
    }
    
    response = client.post("/api/hands", json=hand_data)
    assert response.status_code == 422


def test_create_hand_wrong_player_count():
    """Test creating a hand with wrong number of players"""
    hand_data = {
        "bb_size": 40,
        "seats": [
            {"seat": 0, "name": "Player0", "starting_stack": 1000, "role": "BTN"},
            {"seat": 1, "name": "Player1", "starting_stack": 1000, "role": "SB"},
        ],
        "hole_cards": {},
        "board": {},
        "actions": []
    }
    
    response = client.post("/api/hands", json=hand_data)
    assert response.status_code == 422


def test_list_hands():
    """Test listing hands"""
    response = client.get("/api/hands")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_hand_not_found():
    """Test getting a non-existent hand"""
    response = client.get("/api/hands/non-existent-id")
    assert response.status_code == 404
