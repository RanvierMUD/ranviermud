Login event flow
==
                      intro (MOTD)
                        |
      (new account) __login__  (existing account)
                   /         \
     create-account           password
        |                            |
    new-account-password        choose-character
        |                            |
    create-player                    |
        |                            |
    player-name-check                |
        |                            |
    finish-player                    |
        |_________________________-done (add player to game world)
                                     |
                                   commands
             (command prompt, all player input after login goes through this event)
