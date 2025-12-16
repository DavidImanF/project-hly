import { JSX } from "react";

interface CardStatProps {
    title: string;
    value: string | number;
}

export default function CardStat({ title, value }: CardStatProps): JSX.Element {
    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <p className="text-gray-500">{title}</p>
            <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>
    );
}
