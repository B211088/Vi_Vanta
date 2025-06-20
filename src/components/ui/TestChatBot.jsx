import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const TestChatBot = () => {
  const { loading, section } = useSelector((state) => state.chatbot);
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("id");

  const [input, setInput] = useState({
    collectionId: collectionId,
    question: "",
  });

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return <div className="w-full flex gap-[5px]"> </div>;
};

export default TestChatBot;
