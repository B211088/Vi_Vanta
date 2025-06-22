import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getDetailCollection } from "../../../../services/collection.service";
import { formatDateDDMMYYHHMMSS } from "../../../../utils/formatDate";

const DetailCollection = () => {
  const { loading, collection, documents } = useSelector(
    (state) => state.collection
  );
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    dispatch(getDetailCollection(id));
  }, [id, dispatch]);

  console.log({ documents });
  return (
    <div className="w-full  flex items-center   gap-[px]  px-[20px] py-[12px] ">
      <div className="w-5/12 flex flex-col gap-[10px] text-sm text-justify border-[1px] px-[10px] py-[5px] border-dark-700  rounded-sm">
        <div className="w-full flex items-center ">
          <div className="w-6/12 ">Mẫu</div>
          <div className="w-6/12">
            {collection?.collection?.embeddingTemplate?.name}
          </div>
        </div>
        <div className="w-full flex items-center ">
          <div className="w-6/12 ">Proviver</div>
          <div className="w-6/12">
            {collection?.collection?.embeddingTemplate?.provider}
          </div>
        </div>
        <div className="w-full flex items-center ">
          <div className="w-6/12 ">Vector DataBase</div>
          <div className="w-6/12">{collection?.collection?.vectorDatabase}</div>
        </div>
        <div className="w-full flex items-center ">
          <div className="w-6/12 ">Created By</div>
          <div className="w-6/12">{collection?.collection?.owner.fullName}</div>
        </div>{" "}
        <div className="w-full flex items-center ">
          <div className="w-6/12 ">Created At</div>
          <div className="w-6/12">
            {formatDateDDMMYYHHMMSS(collection?.collection?.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCollection;
