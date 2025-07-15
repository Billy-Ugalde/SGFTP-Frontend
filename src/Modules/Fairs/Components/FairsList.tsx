import { useState } from 'react';
import { useFairs, useDeleteFair, useEnableFair, useDisableFair } from '../Services/FairsServices';
import type { Fair, FairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';
import FairStatusManager from './FairStatusManager';
import GenericModal from './GenericModal';

const FairsList = () => {
  const { data: fairs, isLoading, error } = useFairs();
  const deleteFairMutation = useDeleteFair();
  const enableFairMutation = useEnableFair();
  const disableFairMutation = useDisableFair();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | FairStatus>('all');
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fairToDelete, setFairToDelete] = useState<Fair | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-gray-600">Loading fairs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading fairs: {error.message}</p>
      </div>
    );
  }

  // Filter fairs
  const filteredFairs = fairs?.filter(fair => {
    const matchesSearch = fair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fair.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fair.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: FairStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      registration_open: 'bg-green-100 text-green-800',
      registration_closed: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: FairStatus) => {
    const labels = {
      draft: 'Draft',
      published: 'Published',
      registration_open: 'Registration Open',
      registration_closed: 'Registration Closed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      suspended: 'Suspended'
    };
    return labels[status] || status;
  };

  const handleDeleteClick = (fair: Fair) => {
    setFairToDelete(fair);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fairToDelete) return;
    
    try {
      await deleteFairMutation.mutateAsync(fairToDelete.id);
      setShowDeleteModal(false);
      setFairToDelete(null);
    } catch (error) {
      console.error('Error deleting fair:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFairToDelete(null);
  };

  const handleEnable = async (id: number) => {
    try {
      await enableFairMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error enabling fair:', error);
    }
  };

  const handleDisable = async (id: number) => {
    try {
      await disableFairMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Error disabling fair:', error);
    }
  };

  const handleManageStatus = (fair: Fair) => {
    setSelectedFair(fair);
    setShowStatusModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      environmental: 'Environmental',
      cultural: 'Cultural',
      artisan: 'Artisan',
      entrepreneurship: 'Entrepreneurship',
      community: 'Community',
      educational: 'Educational'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search fairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | FairStatus)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-48"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="registration_open">Registration Open</option>
          <option value="registration_closed">Registration Closed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Results Count */}
      {fairs && (
        <div className="text-sm text-gray-600">
          Showing {filteredFairs.length} of {fairs.length} fairs
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="ml-2 text-emerald-600 hover:text-emerald-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Fairs Grid */}
      {filteredFairs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg mb-2">No fairs found</p>
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all'
              ? 'Try changing your search filters'
              : 'Create your first fair to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredFairs.map(fair => (
            <div key={fair.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{fair.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fair.status)}`}>
                      {getStatusLabel(fair.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{fair.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="text-base">📅</span>
                      {formatDate(fair.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">⏰</span>
                      {fair.startTime} - {fair.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">📍</span>
                      {fair.city}, {fair.province}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">👥</span>
                      {fair.currentParticipants}/{fair.maxParticipants} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">📂</span>
                      {getCategoryLabel(fair.category)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="text-base">👤</span>
                      {fair.responsiblePerson}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">📧</span>
                      {fair.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-base">📞</span>
                      {fair.phone}
                    </span>
                  </div>

                  {fair.requirements && fair.requirements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {fair.requirements.slice(0, 3).map((requirement, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {requirement}
                          </span>
                        ))}
                        {fair.requirements.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{fair.requirements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Enable/Disable Button */}
                  {fair.status !== 'published' && fair.status !== 'registration_open' ? (
                    <button
                      onClick={() => handleEnable(fair.id)}
                      disabled={enableFairMutation.isPending}
                      className="px-3 py-1 text-sm font-medium text-green-600 
                                border border-green-600 rounded hover:bg-green-50
                                focus:ring-2 focus:ring-green-200 disabled:opacity-50
                                transition-colors duration-200"
                      title="Enable Fair"
                    >
                      {enableFairMutation.isPending ? 'Enabling...' : 'Enable'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDisable(fair.id)}
                      disabled={disableFairMutation.isPending}
                      className="px-3 py-1 text-sm font-medium text-orange-600 
                                border border-orange-600 rounded hover:bg-orange-50
                                focus:ring-2 focus:ring-orange-200 disabled:opacity-50
                                transition-colors duration-200"
                      title="Disable Fair"
                    >
                      {disableFairMutation.isPending ? 'Disabling...' : 'Disable'}
                    </button>
                  )}

                  {/* Manage Status Button */}
                  <button
                    onClick={() => handleManageStatus(fair)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 
                              border border-blue-600 rounded hover:bg-blue-50
                              focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    title="Manage Status"
                  >
                    Status
                  </button>

                  {/* Edit Button */}
                  <EditFairButton fair={fair} />

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(fair)}
                    disabled={deleteFairMutation.isPending}
                    className="px-3 py-1 text-sm font-medium text-red-600 
                              border border-red-600 rounded hover:bg-red-50
                              focus:ring-2 focus:ring-red-200 disabled:opacity-50
                              transition-colors duration-200"
                    title="Delete Fair"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <GenericModal
        show={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-gray-700">
              Are you sure you want to delete the fair{' '}
              <span className="font-semibold">"{fairToDelete?.name}"</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteFairMutation.isPending}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
                deleteFairMutation.isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {deleteFairMutation.isPending ? 'Deleting...' : 'Delete Fair'}
            </button>
          </div>
        </div>
      </GenericModal>

      {/* Status Management Modal */}
      {showStatusModal && selectedFair && (
        <FairStatusManager
          fair={selectedFair}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedFair(null);
          }}
        />
      )}
    </div>
  );
};

export default FairsList;