import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService } from "../../services/notificationService.js";
import { formatDate } from "../../utils/format.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getMine().then((res) => {
      setNotifications(res.data.data.notifications);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="text-sm text-muted hover:text-ink">Mark all as read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="We'll notify you about order updates and more." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`card p-4 ${!n.isRead ? "border-l-4 border-l-ink" : ""}`}>
              <div className="flex justify-between">
                <p className="text-sm font-medium">{n.title}</p>
                <span className="text-xs text-muted">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-sm text-muted mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
