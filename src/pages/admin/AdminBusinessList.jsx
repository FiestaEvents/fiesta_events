import React, { useState, useEffect } from "react";
import { adminService } from "../../api/services/adminService";
import Table from "../../components/common/NewTable";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { toast } from "react-hot-toast";

const AdminBusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBusinesses({ limit: 100 });
      setBusinesses(res.data?.businesses || res.businesses || []);
    } catch (err) {
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateSubscription(id, { status: newStatus });
      toast.success(`Business ${newStatus}`);
      fetchBusinesses();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const columns = [
    { header: "Business Name", accessor: "name", sortable: true },
    { header: "Owner", accessor: "owner", render: (row) => row.owner?.email || "N/A" },
    { header: "Category", accessor: "category", render: (row) => <span className="capitalize">{row.category}</span> },
    { 
      header: "Subscription", 
      accessor: "subscription", 
      render: (row) => (
        <Badge variant={row.subscription?.status === 'active' ? 'success' : 'danger'}>
          {row.subscription?.status} ({row.subscription?.plan})
        </Badge>
      ) 
    },
    {
      header: "Actions",
      render: (row) => (
        <Button 
          size="sm" 
          variant={row.subscription?.status === 'active' ? "danger" : "success"}
          onClick={() => toggleStatus(row._id, row.subscription?.status)}
        >
          {row.subscription?.status === 'active' ? "Suspend" : "Activate"}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table columns={columns} data={businesses} loading={loading} pagination={true} pageSize={10} />
      </div>
    </div>
  );
};

export default AdminBusinessList;