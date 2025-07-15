import { useState } from 'react';
import { useUpdateFairStatus } from '../Services/FairsServices';
import type { Fair, FairStatus } from '../Services/FairsServices';
import GenericModal from './GenericModal';

interface FairStatusManagerProps {
  fair: Fair;
  onClose: () => void;
}

const FairStatusManager: React.FC<FairStatusManagerProps> = ({ fair, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<FairStatus | null>(null);
  const [reason, setReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const updateStatusMutation = useUpdateFairStatus();

  const statusOptions = {
    draft: { 
      label: 'Draft', 
      color: 'bg-gray-100 text-gray-800', 
      description: 'Fair is being prepared and not yet public',
      icon: '📝'
    },
    published: { 
      label: 'Published', 
      color: 'bg-blue-100 text-blue-800', 
      description: 'Fair is visible to the public but registration not open',
      icon: '📢'
    },
    registration_open: { 
      label: 'Registration Open', 
      color: 'bg-green-100 text-green-800', 
      description: 'Actively accepting new participants',
      icon: '✅'
    },
    registration_closed: { 
      label: 'Registration Closed', 
      color: 'bg-yellow-100 text-yellow-800', 
      description: 'No longer accepting new participants',
      icon: '🔒'
    },
    in_progress: { 
      label: 'In Progress', 
      color: 'bg-purple-100 text-purple-800', 
      description: 'Fair is currently taking place',
      icon: '🎪'
    },
    completed: { 
      label: 'Completed', 
      color: 'bg-green-200 text-green-900', 
      description: 'Fair has finished successfully',
      icon: '🏆'
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-800', 
      description: 'Fair was cancelled and will not take place',
      icon: '❌'
    },
    suspended: { 
      label: 'Suspended', 
      color: 'bg-orange-100 text-orange-800', 
      description: 'Fair is temporarily suspended',
      icon: '⏸️'
    }
  };

  const allowedTransitions: Record<FairStatus, FairStatus[]> = {
    draft: ['published', 'cancelled'],
    published: ['registration_open', 'suspended', 'cancelled'],
    registration_open: ['registration_closed', 'suspended', 'cancelled'],
    registration_closed: ['in_progress', 'registration_open', 'suspended', 'cancelled'],
    in_progress: ['completed', 'suspended'],
    completed: [],
    cancelled: ['draft'],
    suspended: ['published', 'registration_open', 'cancelled']
  };

  const currentStatusInfo = statusOptions[fair.status];
  const availableTransitions = allowedTransitions[fair.status];

  const handleStatusChange = (newStatus: FairStatus) => {
    setSelectedStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: fair.id,
        status: selectedStatus,
        reason: reason.trim() || undefined
      });
      setShowConfirmModal(false);
      setSelectedStatus(null);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    setSelectedStatus(null);
    setReason('');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Main Status Management Modal */}
      <GenericModal
        show={true}
        onClose={onClose}
        title={`Manage Status: ${fair.name}`}
        size="xl"
        maxHeight={true}
      >
        <div className="space-y-6">
          {/* Current Status Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Status</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentStatusInfo.icon}</span>
              <div className="flex-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.color}`}>
                  {currentStatusInfo.label}
                </span>
                <p className="text-sm text-gray-600 mt-1">{currentStatusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Fair Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Fair Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span><strong>Date:</strong> {formatDate(fair.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⏰</span>
                <span><strong>Time:</strong> {fair.startTime} - {fair.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <span><strong>Location:</strong> {fair.city}, {fair.province}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">👥</span>
                <span><strong>Participants:</strong> {fair.currentParticipants}/{fair.maxParticipants}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <span><strong>Responsible:</strong> {fair.responsiblePerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📂</span>
                <span><strong>Category:</strong> {fair.category}</span>
              </div>
            </div>
          </div>

          {/* Available Status Changes */}
          {availableTransitions.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Available Status Changes
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({availableTransitions.length} option{availableTransitions.length !== 1 ? 's' : ''} available)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTransitions.map((status) => {
                  const statusInfo = statusOptions[status];
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updateStatusMutation.isPending}
                      className="group p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-left
                                hover:shadow-md active:scale-95"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {statusInfo.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${statusInfo.color}`}>
                            {statusInfo.label}
                          </div>
                          <p className="text-xs text-gray-600 leading-tight">
                            {statusInfo.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-3 block">🔒</span>
              <p className="text-gray-500 font-medium">No status changes available</p>
              <p className="text-sm text-gray-400 mt-1">
                The current status "{currentStatusInfo.label}" cannot be changed to any other status.
              </p>
            </div>
          )}
        </div>
      </GenericModal>

      {/* Confirmation Modal */}
      <GenericModal
        show={showConfirmModal}
        onClose={handleConfirmCancel}
        title="Confirm Status Change"
        size="md"
      >
        <div className="space-y-4">
          {selectedStatus && (
            <>
              {/* Status Change Preview */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-2xl block mb-1">{currentStatusInfo.icon}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.color}`}>
                      {currentStatusInfo.label}
                    </span>
                  </div>
                  
                  <div className="text-2xl text-gray-400">→</div>
                  
                  <div className="text-center">
                    <span className="text-2xl block mb-1">{statusOptions[selectedStatus].icon}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusOptions[selectedStatus].color}`}>
                      {statusOptions[selectedStatus].label}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {statusOptions[selectedStatus].description}
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for change (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Describe the reason for this status change..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={updateStatusMutation.isPending}
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 ${
                    updateStatusMutation.isPending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'hover:bg-emerald-700'
                  }`}
                  style={{ backgroundColor: updateStatusMutation.isPending ? undefined : "#52AC83" }}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Change'}
                </button>
              </div>
            </>
          )}
        </div>
      </GenericModal>
    </>
  );
};

export default FairStatusManager;