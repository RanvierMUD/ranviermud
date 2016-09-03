function timestamp () {
  date +"%T"
}
echo "Backing up at $(timestamp)"
mkdir ../ranvier-backups/accounts/$(timestamp)/
cp data/accounts/*.json ../ranvier-backups/accounts/$(timestamp)/
