function timestamp () {
  date +"%T"
}
echo Backing up at $(timestamp)
cp data/players/*.json ../ranvier-backups/$(timestamp)/*.json
