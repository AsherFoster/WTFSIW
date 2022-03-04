gcloud version || true
if [ ! -d "$HOME/google-cloud-sdk" ]; then
  export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)";
  echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list;
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - ;
  sudo apt-get update && sudo apt-get install google-cloud-sdk=212.0.0-0;
fi
gcloud version
