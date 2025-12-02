// src/pages/team/TeamPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";
import { teamService } from "../../api/index";
import {
  PlusIcon,
  RefreshCwIcon,
  UserIcon,
} from "../../components/icons/IconComponents";

const TeamList = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search & filter
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        role: role !== "all" ? role : undefined,
        page,
        limit,
      };
      const res = await teamService.getAll(params);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setTeamMembers(res.data);
          setTotalPages(1);
        } else {
          setTeamMembers(res.data.members || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setTeamMembers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to load team members.");
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [search, role, page, limit]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Handlers
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    fetchTeamMembers();
    handleCloseModal();
  };

  const handleRefresh = () => {
    fetchTeamMembers();
  };

  const handleSearchChange = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleRoleChange = (e) => {
    setPage(1);
    setRole(e.target.value);
  };

  // Stats
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const pendingInvites = teamMembers.filter(
    (m) => m.status === "pending"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-8 h-8" />
            Team
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage your venue staff and collaborators
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAddMember}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Members
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {totalMembers}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Members
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {activeMembers}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Pending Invites
          </div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingInvites}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search team members"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={role}
            onChange={handleRoleChange}
            options={[
              { value: "all", label: "All Roles" },
              { value: "manager", label: "Manager" },
              { value: "staff", label: "Staff" },
            ]}
            aria-label="Filter by role"
          />
        </div>
      </div>

      {/* Team Members Table */}
      <div>
        {teamMembers.length > 0 ? (
          <>
            <Table
              columns={["Name", "Email", "Role", "Status", "Actions"]}
              data={teamMembers.map((member) => [
                member.name,
                member.email,
                member.role || "N/A",
                <Badge
                  key={`badge-${member.id}`}
                  color={member.status === "active" ? "green" : "yellow"}
                >
                  {member.status}
                </Badge>,
                <div key={`actions-${member.id}`} className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewMember(member)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditMember(member)}
                  >
                    Edit
                  </Button>
                </div>,
              ])}
            />
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={setLimit}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <UserIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">
              No team members found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      {/* View Member Modal */}
      {isModalOpen && selectedMember && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Team Member Details"
        >
          <TeamDetails
            member={selectedMember}
            onEdit={() => handleEditMember(selectedMember)}
          />
        </Modal>
      )}

      {/* Add/Edit Member Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedMember ? "Edit Member" : "Add Member"}
        >
          <TeamForm
            member={selectedMember}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default TeamList;
