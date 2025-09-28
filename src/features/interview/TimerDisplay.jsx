import { useSelector } from "react-redux";

export default function TimerDisplay() {
  const timer = useSelector((state) => state.interview.timer);
  const status = useSelector((state) => state.interview.status);

  if (status !== "running") return null;

  // pick a color based on urgency
  let color = "text-green-600";
  if (timer <= 10) color = "text-red-600 font-bold";
  else if (timer <= 20) color = "text-orange-500";

  return (
    <div className="text-center py-1">
      <span className={`text-lg transition-colors duration-500 ${color}`}>
        ⏱ {timer}s
      </span>
    </div>
  );
}
