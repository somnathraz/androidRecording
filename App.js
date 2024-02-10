/* eslint-disable react-native/no-inline-styles */
import {View, Button} from 'react-native';
import React, {useState} from 'react';
import LiveAudioStream from 'react-native-live-audio-stream';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Buffer} from 'buffer';
import axios from 'axios';
const options = {
  sampleRate: 32000, // default is 44100 but 32000 is adequate for accurate voice recognition
  channels: 1, // 1 or 2, default 1
  bitsPerSample: 16, // 8 or 16, default 16
  audioSource: 7, // android only (see below)
  bufferSize: 4096, // default is 2048
};
LiveAudioStream.init(options);

export default function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState([]);

  LiveAudioStream.on('data', data => {
    // base64-encoded audio data chunks
    const chunk = Buffer.from(data, 'base64');
    console.log(chunk);
  });
  const handleStreamToggle = async () => {
    setIsStreaming(!isStreaming);
    if (isStreaming) {
      LiveAudioStream.stop();
    } else {
      check(PERMISSIONS.ANDROID.RECORD_AUDIO || PERMISSIONS.IOS.MICROPHONE)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.log(
                'This feature is not available (on this device / in this context)',
              );
              break;
            case RESULTS.DENIED:
              request(PERMISSIONS.ANDROID.RECORD_AUDIO).then(resultData => {
                console.log(resultData);
              });
              console.log(
                'The permission has not been requested / is denied but requestable',
              );
              break;
            case RESULTS.LIMITED:
              console.log(
                'The permission is limited: some actions are possible',
              );
              break;
            case RESULTS.GRANTED:
              console.log('The permission is granted');
              break;
            case RESULTS.BLOCKED:
              console.log(
                'The permission is denied and not requestable anymore',
              );
              break;
          }
        })
        .catch(error => {
          console.log('====================================');
          console.log(error);
          console.log('====================================');
        });
      LiveAudioStream.init(options);
      LiveAudioStream.start();
    }
  };
  return (
    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#4f419a',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialCommunityIcons name="microphone" size={54} color="#fff" />
      </View>
      <Button
        title={isStreaming ? 'Stop Streaming' : 'Start Streaming'}
        onPress={handleStreamToggle}
      />
    </View>
  );
}
