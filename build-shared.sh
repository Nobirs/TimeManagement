cd /home/deklein/Programming/React/TimeManagement_v2/shared-types;
npm run build;
cd ../server;
npm install ../shared-types;
cd ../client;
npm install ../shared-types;
echo "SUCCESS...maybe...";