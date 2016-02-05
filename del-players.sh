mkdir ../ranvier-backups/
rm ../ranvier-backups/*.json
cp data/players/*.json ../../../ranvier-backups/*.json
echo Copied players to backup dir...
rm data/players/*.json
echo Deleted players
