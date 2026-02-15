import "./dashboard.scss";
import { useGetDashboardStatsQuery } from "../../slice/dashboardSlice";
import {
  Hotel,
  DoorOpen,
  Building2,
  Users,
  BookCheck,
  DollarSign,
  TrendingUp,
  Clock,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const Dashboard = () => {
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing statistics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Hotels",
      value: stats?.totalHotels,
      icon: <Hotel size={24} />,
      color: "blue",
    },
    {
      title: "Total Rooms",
      value: stats?.totalRooms,
      icon: <DoorOpen size={24} />,
      color: "green",
    },
    {
      title: "Total Apartments",
      value: stats?.totalApartments,
      icon: <Building2 size={24} />,
      color: "purple",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: <Users size={24} />,
      color: "orange",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings,
      icon: <BookCheck size={24} />,
      color: "teal",
    },
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: "gold",
    },
  ];

  const bookingStatusData =
    stats?.bookingsByStatus.map((item) => ({
      name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
      value: item.count,
    })) || [];

  const roomTypeData =
    stats?.roomsByType.map((item) => ({
      name: item.type,
      count: item.count,
    })) || [];

  return (
    <div className="dashboard-container">
      <div className="header">
        <div className="title-section">
          <h1>Admin Dashboard</h1>
          <p>Overview of your hotel booking platform</p>
        </div>
        <div className="date-display">
          <Clock size={16} />
          <span>{format(new Date(), "MMMM do, yyyy")}</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <TrendingUp size={20} />
          <div>
            <p>⚠️ Error loading real-time statistics.</p>
            <p className="error-detail">
              Please ensure the backend server is running.
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-header">
              <div className="icon-wrapper">{card.icon}</div>
              <h3>{card.title}</h3>
            </div>
            <p className="stat-value">{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <div className="icon-wrapper">
              <PieChartIcon size={20} />
            </div>
            <h2>Booking Status</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingStatusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="icon-wrapper">
              <BarChartIcon size={20} />
            </div>
            <h2>Rooms by Category</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomTypeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-bookings section">
          <div className="section-header">
            <div className="title-with-icon">
              <BookCheck size={20} />
              <h2>Recent Bookings</h2>
            </div>
          </div>
          <div className="bookings-list">
            {stats?.recentBookings.length ? (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Hotel</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td>{booking.user.username}</td>
                      <td>{booking.hotel.name}</td>
                      <td>
                        {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${booking.status.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>${booking.paymentAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No recent bookings found.</p>
            )}
          </div>
        </div>

        <div className="stats-breakdown section">
          <div className="section-header">
            <div className="title-with-icon">
              <Users size={20} />
              <h2>User Distribution</h2>
            </div>
          </div>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <h4>Users by Role</h4>
              {stats?.usersByRole.map((role: any) => (
                <div key={role.role} className="bar-row">
                  <span className="label">{role.role}</span>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(role.count / stats.totalUsers) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="count">{role.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
