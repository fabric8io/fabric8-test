# Needed ENV variables
#export WORK_ITEMS_SPACE=2e0698d8-753e-4cef-bb7c-f027634824a2
#export WORK_ITEMS_BASE_URI="api/spaces/$WORK_ITEMS_SPACE/workitems"
#export WORK_ITEMS_URI="http://$SERVER_HOST:$SERVER_PORT/$WORK_ITEMS_BASE_URI"
set +x

workitem_count=`curl -silent -X GET --header 'Accept: application/json' $WORK_ITEMS_URI`
if [[ $workitem_count == *"Time-out"* ]];
then
	echo "Unabled to get the workitem total count: $workitem_count"
else
	echo $workitem_count | sed s/.*totalCount/\\n\\n\\n"totalCount of workitems in DB"/g | sed s/\"//g | sed s/}//g| grep totalCount
fi
