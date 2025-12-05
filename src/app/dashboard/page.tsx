/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import {
  Avatar,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tag,
  Table,
  Typography,
  Spin,
  Upload,
  Card,
  Popover,
  Button,
  Space,
} from "antd";
import Icon, { UserOutlined } from "@ant-design/icons";
import { Send, Eye, Save } from "lucide-react";
import Image from "next/image";
import InfoPersonal from "@/components/infoPersonal";
import { setUserAvatar } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hook";
import dayjs from "dayjs";
import RoleTag from "@/components/RoleTag";

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [dataProfile, setDataProfile] = useState<any>();
  const [employees, setEmployees] = useState<any[]>([]);
  const [managerUser, setManagerUser] = useState<number>();
  const [employeeAssets, setEmployeeAssets] = useState<any[]>([]);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // fetch profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/profile");
      if (!res.ok) throw new Error("Lỗi khi tải hồ sơ");
      const data = await res.json();
      setDataProfile(data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải hồ sơ cá nhân");
    } finally {
      setLoading(false);
    }
  };

  // fetch employees for manager select
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees/employeeProposal");
      if (!res.ok) throw new Error("Lỗi khi tải nhân viên");
      const data = await res.json();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // fetch assets by employee
  const fetchEmployeeAssets = async (employeeId: number) => {
    setLoadingAssets(true);
    try {
      const res = await fetch(
        `/api/assets/by-employee?employeeId=${employeeId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Lỗi khi tải tài sản");
      const data = await res.json();
      setEmployeeAssets(data.assets || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách tài sản cá nhân");
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (dataProfile?.id) {
      setManagerUser(dataProfile.managerId);
      fetchEmployeeAssets(dataProfile.id);
      form.setFieldsValue({
        phoneNumber: dataProfile.contactInfo?.phoneNumber ?? "",
        relativePhone: dataProfile.contactInfo?.relativePhone ?? "",
        companyPhone: dataProfile.contactInfo?.companyPhone ?? "",
        email: dataProfile.contactInfo?.email ?? "",
      });
      setImageUrl(dataProfile.avatar);
    }
  }, [dataProfile, form]);

  // update profile
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: imageUrl ?? "",
          phone: values.phoneNumber,
          personalPhone: values.relativePhone,
          companyPhone: values.companyPhone,
          email: values.email,
          managerId: managerUser ?? 0,
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      dispatch(setUserAvatar(imageUrl ?? ""));
      message.success("Cập nhật hồ sơ thành công");
      fetchProfile();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // upload handlers
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("Chỉ hỗ trợ JPG/PNG");
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Ảnh phải nhỏ hơn 2MB");
    return isJpgOrPng && isLt2M;
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChangeAvatar = async (e: any) => {
    const file = e.target.files?.[0] ?? e.file?.originFileObj;
    if (!file) return;
    if (!beforeUpload(file)) return;
    const url = await getBase64(file);
    setImageUrl(url);
  };

  // select options
  const userSelectOptions = employees.map((user) => ({
    label: (
      <div className="flex items-center gap-2">
        <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
        <span>{user.name}</span>
      </div>
    ),
    value: user.id,
  }));

  // columns with tailwind-friendly render
  const assetColumns = [
    {
      title: "Tên tài sản",
      dataIndex: ["asset", "name"],
      width: "250px",
      key: "name",
      render: (_: any, record: any) => (
        <div className="w-full flex-shrink-0">
          <div className="font-medium text-sm text-slate-900">
            {record.asset?.name || "-"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {record.asset?.description || "Không có mô tả"}
          </div>
        </div>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "asset",
      key: "unit",
      render: (asset: any) => (
        <div className="text-sm text-slate-700">{asset?.unit || "-"}</div>
      ),
      width: 120,
      align: "center" as const,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => (
        <Tag color="processing" className="text-sm">
          {qty}
        </Tag>
      ),
      width: 110,
      align: "center" as const,
    },
    {
      title: "Ngày cấp",
      dataIndex: "issuedAt",
      key: "issuedAt",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
      width: 170,
      align: "center" as const,
    },
    {
      title: "Người cấp",
      dataIndex: "issuedBy",
      key: "issuedBy",
      render: (issuedBy: any) => {
        if (!issuedBy) return <Text type="secondary">— (Đã xóa)</Text>;
        const content = (
          <div className="min-w-[220px]">
            <div className="flex items-center gap-3">
              <Avatar size={48} src={issuedBy.avatar} icon={<UserOutlined />} />
              <div>
                <div className="font-semibold">{issuedBy.name}</div>
                <div className="text-xs text-slate-500">
                  Mã NV: {issuedBy.employeeCode || "-"}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Tag className="text-xs">{issuedBy.role || "USER"}</Tag>
                  {issuedBy.isActive === false && (
                    <Tag color="warning" className="text-xs">
                      Inactive
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        return (
          <Popover content={content} placement="topLeft" trigger="hover">
            <div className="flex items-center gap-3">
              <Avatar
                size="small"
                src={issuedBy.avatar}
                icon={<UserOutlined />}
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{issuedBy.name}</span>
                <span className="text-xs text-slate-500">{issuedBy.role}</span>
              </div>
            </div>
          </Popover>
        );
      },
      width: 240,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => (
        <div className="text-sm text-slate-700">{note || "-"}</div>
      ),
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            className="text-slate-700 hover:text-slate-900"
            icon={<Eye size={16} />}
            onClick={() => {
              setSelectedAsset(record);
              setAssetModalVisible(true);
            }}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  // asset modal content
  const renderAssetModal = () => {
    if (!selectedAsset) return null;
    const { asset, quantity, note, issuedAt, issuedBy } = selectedAsset;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2">{asset?.name || "—"}</h3>
          <p className="text-sm text-slate-600 mb-4">
            {asset?.description || "Không có mô tả"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Đơn vị</span>
              <span className="text-sm text-slate-800">
                {asset?.unit || "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Số lượng</span>
              <span className="text-sm text-slate-800">{quantity}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Ngày cấp</span>
              <span className="text-sm text-slate-800">
                {issuedAt ? dayjs(issuedAt).format("DD/MM/YYYY HH:mm") : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Ghi chú</span>
              <span className="text-sm text-slate-800">{note || "-"}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm font-medium mb-3">Người cấp</div>
          {issuedBy ? (
            <div className="flex items-center gap-3">
              <Avatar size={64} src={issuedBy.avatar} icon={<UserOutlined />} />
              <div>
                <div className="font-semibold">{issuedBy.name}</div>
                <div className="text-xs text-slate-500">
                  Mã NV: {issuedBy.employeeCode || "-"}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Tag className="text-xs">{issuedBy.role}</Tag>
                  {issuedBy.isActive === false && (
                    <Tag color="warning" className="text-xs">
                      Inactive
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Người cấp đã bị xóa hoặc không tồn tại
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center w-full px-4 py-8">
      <div className="w-full max-w-[1200px]">
        <div className="mb-6">
          <Title level={2} className="!mb-0">
            Hồ sơ cá nhân
          </Title>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin cá nhân và tài sản đã cấp
          </p>
        </div>

        {/* profile card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-40 flex flex-col items-center">
              <div className="mt-4 w-full flex justify-center">
                <Upload
                  name="avatar"
                  className=""
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleChangeAvatar}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="avatar"
                      width={200}
                      height={200}
                      className="object-cover"
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: 36, color: "#9CA3AF" }} />
                  )}
                </Upload>
              </div>
            </div>

            <div className="flex-1 items-center">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 items-center">
                <div>
                  <div className="text-xl font-semibold">
                    {dataProfile?.name || "—"}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Mã NV: {dataProfile?.employeeCode || "-"} •{" "}
                    {dataProfile?.workInfo?.department?.name || "-"}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <RoleTag role={dataProfile?.role} size="md" />
                    <div className="text-sm text-slate-500">
                      Ngày sinh:{" "}
                      {dataProfile?.birthDate ? dataProfile?.birthDate : "-"}
                    </div>
                  </div>
                  <div className="mt-3 w-full">
                    <button
                      className="
    w-full inline-flex items-center justify-center gap-2 
    px-4 py-2 rounded-lg text-sm font-medium
    bg-slate-900 text-white
    hover:bg-slate-800 active:scale-[0.98]
    transition-all duration-150
  "
                      onClick={handleUpdateProfile}
                    >
                      <Save size={16} />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-80">
                  <Form form={form} layout="vertical">
                    <Form.Item
                      label="Số điện thoại"
                      name="phoneNumber"
                      className="mb-2 font-bold text-[#4a4a6a]"
                    >
                      <Input type="number" size="middle" />
                    </Form.Item>
                    <Form.Item
                      label="Email"
                      name="email"
                      className="mb-2 font-bold text-[#4a4a6a]"
                    >
                      <Input type="email" size="middle" />
                    </Form.Item>
                    <Form.Item
                      label="Người quản lý"
                      className="mb-0 font-bold text-[#4a4a6a]"
                    >
                      <Select
                        placeholder="Chọn người quản lý"
                        value={managerUser}
                        onChange={(value) => setManagerUser(value)}
                        options={userSelectOptions}
                        style={{ width: "100%" }}
                        size="middle"
                      />
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* assets */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tài sản cá nhân đã cấp</h3>
            <div className="text-sm text-slate-500">
              Tổng: {employeeAssets.length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            {loadingAssets ? (
              <div className="py-10 flex justify-center">
                <Spin />
              </div>
            ) : employeeAssets.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Chưa có tài sản nào được cấp
              </div>
            ) : (
              // scroll wrapper for responsive horizontal scroll
              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <Table
                    rowKey={(record) => record.id}
                    columns={assetColumns}
                    dataSource={employeeAssets}
                    pagination={false}
                    bordered
                    size="middle"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* asset modal */}
      <Modal
        title="Chi tiết tài sản"
        open={assetModalVisible}
        footer={null}
        onCancel={() => {
          setAssetModalVisible(false);
          setSelectedAsset(null);
        }}
        width={900}
        bodyStyle={{ padding: 20 }}
      >
        {renderAssetModal()}
      </Modal>
    </div>
  );
};

export default Profile;
