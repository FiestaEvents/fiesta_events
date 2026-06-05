import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Activity,
  Edit,
  ArrowLeft,
  Clock,
} from "lucide-react";

import { teamService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

const TeamMemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, logsRes] = await Promise.all([
          teamService.getById(id),
          teamService.getActivity(id),
        ]);

        setUser(userRes.data?.user || userRes.user);
        setLogs(logsRes.data?.logs || logsRes.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  if (!user)
    return <div className="p-8 text-center">{t("team.detail.notFound")}</div>;

  return (
    <div className="p-6 bg-white rounded-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/team")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/team/${id}/edit`)} icon={Edit}>
          {t("team.detail.editProfile")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-3xl font-bold text-orange-600 dark:text-orange-400">
                {user.name.charAt(0)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {t("team.detail.role")}:
                </span>
                <Badge variant="purple">
                  {user.roleId?.name || t("common.unknown")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {t("team.detail.status")}:
                </span>
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive
                    ? t("team.form.active")
                    : t("team.form.inactive")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {user.phone || t("common.unknown")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {t("team.detail.joined", {
                    date: format(new Date(user.createdAt), "MMM d, yyyy"),
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              {t("team.detail.activityHistory")}
            </h2>

            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {t("team.detail.noActivity")}
              </p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-50 dark:bg-gray-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Activity className="w-4 h-4 text-gray-500" />
                    </div>

                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <time className="font-mono text-xs text-gray-500">
                          {format(new Date(log.timestamp), "MMM d, HH:mm")}
                        </time>
                      </div>
                      <div className="text-gray-500 text-xs">{log.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetail;
