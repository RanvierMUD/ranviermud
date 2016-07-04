mkdir ../ranvier-backups/
sudo rm ../ranvier-backups/*.json
cp data/accounts/*.json ../../../ranvier-account-backups/*.json
echo "Copied accounts to backup dir..."
sudo rm data/accounts/*.json
echo "Deleted accounts!"
