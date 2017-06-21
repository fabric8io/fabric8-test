#set -x

## Needed ENV Variables
#export TOKEN_LIST=$PERFORMANCE_RESULTS/token.keys
#export USERS=10
#export SERVER_HOST=api-perf.dev.rdu2c.fabric8.io
#export SERVER_PORT=80

echo "Generating authentization tokens into $TOKEN_LIST"
rm -rf $TOKEN_LIST
for i in $(seq 1 $USERS);
do
   auth_resp=$(curl --silent -X GET --header 'Accept: application/json' 'http://'$SERVER_HOST':'$SERVER_PORT'/api/login/generate')
   token=$(echo $auth_resp | cut -d ":" -f 3 | sed -e 's/","expires_in//g' | sed -e 's/"//g');
   if [[ "x" != "x$token" ]];
   then
      echo $token >> $TOKEN_LIST;
   else
      echo "ERROR: Unable to acquire authentication token!";
      exit 1;
   fi;
done
