import React from 'react';
import { MapPin, Calendar, Users, Eye, Trash2 } from 'lucide-react';
import type { Activity } from '../Services/ActivityService';
import { getActivityLabels, formatDate } from '../Services/ActivityService';
import EditActivityButton from './EditActivityButton';
import '../Styles/ActivityList.css';

interface ActivityListProps {
  activities: Activity[];
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onView, onEdit, onDelete }) => {
  return (
    <div className="activities-grid">
      {activities.map((activity) => {
        const statusLabel = getActivityLabels.status[activity.Status_activity as keyof typeof getActivityLabels.status];
        const typeLabel = getActivityLabels.type[activity.Type_activity as keyof typeof getActivityLabels.type];

        return (
          <div 
            key={activity.Id_activity} 
            className={`activity-card ${activity.Active ? 'activity-card-active' : 'activity-card-inactive'}`}
          >
            <div>
              <h3 className="activity-title">{activity.Name}</h3>
              <p className="activity-description">{activity.Description}</p>
            </div>

            <div className="activity-meta">
              <div className="activity-meta-item">
                <span className={`activity-badge badge-${activity.Status_activity}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="activity-meta-item">
                <MapPin size={16} />
                <span>{activity.Location}</span>
              </div>

              <div className="activity-meta-item">
                <Calendar size={16} />
                <span>
                  {activity.dateActivities && activity.dateActivities.length > 0
                    ? formatDate(activity.dateActivities[0].Start_date)
                    : 'Sin fecha'}
                </span>
              </div>

              <div className="activity-meta-item">
                <Users size={16} />
                <span>{activity.Spaces ? `${activity.Spaces} espacios` : 'Ilimitado'}</span>
              </div>

              <div className="activity-meta-item">
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {typeLabel} • {activity.project?.Name || 'Sin proyecto'}
                </span>
              </div>
            </div>

            <div className="activity-actions">
              <button className="btn-action btn-view" onClick={() => onView(activity)}>
                <Eye size={16} />
                Ver
              </button>
              <EditActivityButton onClick={() => onEdit(activity)} />
              <button className="btn-action btn-delete" onClick={() => onDelete(activity.Id_activity)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityList;