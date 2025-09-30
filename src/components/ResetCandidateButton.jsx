import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetInterview } from '../features/interview/interviewSlice';
import { resetChat } from '../features/chat/chatSlice';

export default function ResetCandidateButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const interview = useSelector((state) => state.interview);

  const isInterviewFinished = interview.status === 'finished';

  const handleReset = () => {
    dispatch(resetChat());
    dispatch(resetInterview());
    setShowConfirm(false);
  };

  if (!isInterviewFinished) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-40"
      >
        New Candidate
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Start New Interview</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              This will clear all current candidate data and start a fresh interview. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}