import React from "react";

type DetailProps = {
    title: string;
    children: React.ReactNode;
};

type SubDetailProps = {
    title?: string;
    children: React.ReactNode;
};

const Detail: React.FC<DetailProps> & {
    SubDetail: React.FC<SubDetailProps>;
} = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <div>
            <h2 className="text-large-semi mb-2">{title}</h2>
            <div className="flex flex-col gap-y-4 text-small-regular">{children}</div>
        </div>
    );
};

const SubDetail: React.FC<SubDetailProps> = ({ title, children }: { title?: string; children: React.ReactNode }) => {
    return (
        <div className="flex flex-col">
            {title && <span className="text-base-semi">{title}</span>}
            <div className="text-small-regular">{children}</div>
        </div>
    );
};

Detail.SubDetail = SubDetail;

export default Detail;
