
SHARED_ENV="
export GH_USER=$GH_USER
export GH_PASSWORD=$GH_PASSWORD
"

echo "$SHARED_ENV" >> $ENV_FILE-master

if [ "$RUN_LOCALLY" != "true" ]; then
   for i in $(seq 1 $SLAVES); do
      echo "$SHARED_ENV" >> $ENV_FILE-slave-$i;
   done
fi
