gcloud version || true
if [ ! -d "$HOME/google-cloud-sdk/bin" ]; then
  rm -rf $HOME/google-cloud-sdk; export CLOUDSDK_CORE_DISABLE_PROMPTS=1
  curl https://sdk.cloud.google.com | bash
fi
# Add gcloud to $PATH
source /home/travis/google-cloud-sdk/path.bash.inc
gcloud version

