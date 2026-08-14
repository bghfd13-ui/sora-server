import {useEffect, useState} from "react";
import ChatContainer from "./container";
import {getChatSettings} from "../../services/chat";
import ChatStore from "./chatStore";
import authentication from "../../stores/authentication";

const Chat = props => {
  const [enabled, setEnabled] = useState(null);
  const auth = authentication.useContainer();

  useEffect(() => {
    // Conversation endpoints require an authenticated session. Starting the
    // chat for guests caused a failing request every five seconds.
    if (!auth.userId) {
      setEnabled(false);
      return;
    }

    getChatSettings().then(d => {
      if (d.chatEnabled) {
        setEnabled(true);
      }
    }).catch(e => {
      console.error('[error] error fetching chat settings:',e);
    })
  }, [auth.userId]);

  if (!enabled)
    return null;

  return <ChatStore.Provider>
    <ChatContainer />
  </ChatStore.Provider>
}

export default Chat;
