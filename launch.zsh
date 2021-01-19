for i in {1..5}; do
  rm -rf PrivateChromeSessions$i
  cp -r PrivateChromeSessions PrivateChromeSessions$i
  screen -dmS sc$i node index.js PrivateChromeSessions$i &>log$i.txt
done
