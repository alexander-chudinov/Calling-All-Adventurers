# Calling All Adventurers


## Mechanics
- Buildings can be destroyed by monsters
    -
- 5 stats
    - MGC (damage from spells)
    - ATK (damage from normal attacks)
    - DEF (fixed damage reduction)
    - HP  (health)
    - SPD (the fast)
- Killing monsters gives EXP
    - Level cap is 9
    - Gain a new ability every 3 levels
    - Can upgrade a stat


## Buildings
- Adventurer's Guild
    - Players spawn here
- Church
    - Players can heal here
    - Players respawn here


## Events
- playerJoin (client -> server)
    - name
    - fighter
- playerMove (client -> server)
    - x
    - y
- spawnEnemy (server only, happens once every X seconds)
    - updateEnemies (arrow of:)
        - spriteID
        - x
        - y
- playerAction (TODO)
- gameStateUpdate (server -> client)
    - players (array of:)
        - x 
        - y
        - fighter
        - name
    - buildings (array of:)
        - name
        - hp
    