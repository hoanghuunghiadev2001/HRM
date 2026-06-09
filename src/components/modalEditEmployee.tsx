/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  GetProp,
  Input,
  message,
  Select,
  Table,
  Upload,
  UploadProps,
} from "antd";
import ModalLoading from "./modalLoading";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Department, InfoEmployee } from "@/lib/interface";
import Image from "next/image";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useAppSelector } from "@/store/hook";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalEditEmployeeProps {
  open: boolean;
  onClose: () => void;
  employeeInfo?: InfoEmployee;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleUpdateEmployee: (employeeCode: string, infoEmployee: any) => void;
  department: Department[];
}

interface Position {
  id: number;
  name: string;
}

interface EmployeeAsset {
  id: number;
  assetId: number;
  quantity: number;
  note: string | null;
  issuedAt: string | null;
  asset: {
    id: number;
    name: string;
    description: string | null;
    unit: string;
  } | null;
  issuedBy: {
    id: number;
    employeeCode: string;
    name: string;
    role: string;
    avatar: string | null;
    isActive: boolean;
  } | null;
}

const ModalEditEmployee = ({
  onClose,
  open,
  employeeInfo,
  handleUpdateEmployee,
  department,
}: ModalEditEmployeeProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [assets, setAssets] = useState<EmployeeAsset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const fetchEmployeeAssets = async (employeeId: number) => {
    try {
      setAssetLoading(true);
      const res = await fetch(
        `/api/assets/by-employee?employeeId=${employeeId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Không lấy được tài sản");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lấy danh sách tài sản");
    } finally {
      setAssetLoading(false);
    }
  };

  useEffect(() => {
    if (open && employeeInfo?.id) {
      fetchEmployeeAssets(employeeInfo.id);
    }
  }, [open, employeeInfo]);

  const { role } = useAppSelector((state) => state.user);

  const maxDate = dayjs();

  const { Option } = Select;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (formData: any) => {
    // Convert avatar File -> base64 nếu có
    // Chuẩn hóa object gửi đi
    const payload = {
      employeeCode: formData.employeeCode,
      name: formData.name,
      gender: formData.gender,
      birthDate: formData.birthDate,
      role: formData.role,
      avatar: imageUrl ?? null,
      brand: formData.brand, // <-- THÊM CHI NHÁNH VÀO PAYLOAD GỬI ĐI API

      workInfo: {
        department: formData.department,
        position: formData.position,
        specialization: formData.specialization,
        joinedTBD: formData.joinedTBD,
        joinedTeSCC: formData.joinedTeSCC,
        seniorityStart: formData.seniorityStart,
        seniority: formData.seniority,
        contractNumber: formData.contractNumber,
        contractDate: formData.contractDate,
        contractType: formData.contractType,
        contractEndDate: formData.contractEndDate,
      },

      contactInfo: {
        phoneNumber: formData.phoneNumber,
        relativePhone: formData.relativePhone,
        companyPhone: formData.companyPhone,
        email: formData.email,
      },
    };

    //   Gửi API
    if (employeeInfo?.employeeCode) {
      handleUpdateEmployee(employeeInfo?.employeeCode, payload);
    }
  };

  //Up ảnh hồ sơ
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  //chuyển ảnh sang base64
  const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const validateMessages = {
    required: "Vui lòng nhập ${label}",
    types: {
      email: "Chưa đúng định dạng",
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  function transformEmployeeDataToFormData(data: InfoEmployee) {
    return {
      employeeCode: data.employeeCode,
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate ? dayjs(data.birthDate, "DD/MM/YYYY") : null,
      password: data.password, // luôn mặc định
      role: data.role,
      avatarBase64: data.avatar ?? null,

      // workInfo
      brand: (data as any)?.brand ?? "", // <-- THÊM ĐỂ ĐỔ DỮ LIỆU CŨ LÊN FORM (NẾU CÓ)
      department: data.workInfo?.department?.id ?? "",
      position: data.workInfo?.position?.id ?? "",

      // contactInfo
      phoneNumber: data.contactInfo?.phoneNumber ?? "",
      relativePhone: data.contactInfo?.relativePhone ?? "",
      companyPhone: data.contactInfo?.companyPhone ?? "",
      email: data.contactInfo?.email ?? "it@toyota.binhduong.vn",
    };
  }

  const listPosition = async () => {
    const res = await fetch(`/api/departments/${selectedDepartmentId}`);
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json();
    setPositions(departmentsData.positions);
  };

  useEffect(() => {
    if (selectedDepartmentId) {
      listPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId]);

  const fetchData = async () => {
    try {
      const [positionsData] = await Promise.all([
        selectedDepartmentId
          ? fetch(`/api/departments/${selectedDepartmentId}`).then((res) =>
              res.json(),
            )
          : Promise.resolve({ positions: [] }),
      ]);
      setPositions(positionsData.positions);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && employeeInfo && open) {
      setImageUrl(employeeInfo.avatar);

      form.setFieldsValue(transformEmployeeDataToFormData(employeeInfo));
      if (employeeInfo.workInfo?.department?.id) {
        setSelectedDepartmentId(employeeInfo.workInfo?.department?.id);
      }
    }
    setDepartments(department);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeInfo, isMounted]);

  const assetColumns = [
    {
      title: "Tên tài sản",
      dataIndex: ["asset", "name"],
      key: "name",
      render: (_: any, record: EmployeeAsset) => record.asset?.name || "—",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn vị",
      render: (_: any, record: EmployeeAsset) => record.asset?.unit || "—",
    },
    {
      title: "Ngày cấp",
      dataIndex: "issuedAt",
      key: "issuedAt",
      render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Người cấp",
      key: "issuedBy",
      render: (_: any, record: EmployeeAsset) =>
        record.issuedBy ? record.issuedBy.name : "—",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (v: string) => v || "—",
    },
  ];

  return (
    <>
      <Drawer
        title={<p className="text-2xl">Chỉnh Sửa Nhân Sự </p>}
        placement="right"
        onClose={onClose}
        width={900}
        open={open}
      >
        <ModalLoading isOpen={loading} />
        <div className="w-full">
          <div className="mt-2">
            <Form
              {...layout}
              form={form}
              name="control-hooks"
              onFinish={onFinish}
              className="w-full "
              labelCol={{ flex: "110px" }}
              labelAlign="left"
              labelWrap
              validateMessages={validateMessages}
            >
              <div className="flex justify-center">
                <Form.Item
                  name="avatar"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader w-[155px] h-[155px] flex justify-center items-center"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                  >
                    {imageUrl ? (
                      <Image
                        loading="lazy"
                        src={imageUrl}
                        alt="avatar"
                        style={{ width: "145px" }}
                        className="rounded-[50%] h-[145px] object-cover"
                        width={145}
                        height={145}
                        quality={70}
                        priority={false}
                      />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">1. Thông Tin Cá Nhân:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Giới tính" allowClear>
                    <Option value="MALE">Nam</Option>
                    <Option value="FEMALE">Nữ</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Vai trò" allowClear>
                    {role === "ADMIN" ? (
                      <Option value="ADMIN">ADMIN</Option>
                    ) : (
                      ""
                    )}
                    <Option value="MANAGER">MANAGER</Option>
                    <Option value="USER">USER</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="birthDate"
                  label="Ngày sinh"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="employeeCode"
                  label="Mã NV"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">2. Thông Tin Liên Hệ:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="phoneNumber" label="Số DT">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="relativePhone" label="SĐT người thân">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="companyPhone" label="SĐT Cty">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["email"]}
                  label="Email"
                  rules={[{ type: "email" }]}
                >
                  <Input />
                </Form.Item>
              </div>

              {/* PHẦN 3: THÔNG TIN CÔNG VIỆC (ĐÃ SỬA THÀNH GRID 3 CỘT ĐỂ THÊM CHI NHÁNH) */}
              <div className="mb-2 mt-4">
                <p className="text-xl ">3. Thông Tin Công việc:</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Form.Item
                  name="brand"
                  label="Chi nhánh"
                  rules={[
                    { required: true, message: "Vui lòng chọn chi nhánh" },
                  ]}
                >
                  <Select placeholder="Chọn chi nhánh" allowClear>
                    <Option value="TBD">Toyota Bình Dương (TBD)</Option>
                    <Option value="TMP">Toyota Mỹ Phước (TMP)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="department"
                  label="Bộ phận"
                  rules={[{ required: role === "MANAGER" ? false : true }]}
                >
                  <Select
                    placeholder="Bộ phận"
                    disabled={role === "MANAGER"}
                    allowClear
                    onChange={(value) => {
                      setSelectedDepartmentId(value);
                      form.setFieldValue("position", undefined);
                    }}
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  ></Select>
                </Form.Item>

                <Form.Item
                  name="position"
                  label="Chức vụ"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chức vụ"
                    disabled={role === "MANAGER"}
                    allowClear
                    options={positions.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  ></Select>
                </Form.Item>
              </div>

              <div className="mb-2 mt-8">
                <p className="text-xl">4. Tài sản đang sử dụng:</p>
              </div>

              <Table
                rowKey="id"
                loading={assetLoading}
                columns={assetColumns}
                dataSource={assets}
                pagination={false}
                bordered
                locale={{ emptyText: "Nhân viên chưa được cấp tài sản" }}
              />

              <Form.Item
                label={null}
                className="w-full flex justify-center mt-4"
              >
                <Button
                  htmlType="submit"
                  className="flex mt-4 relative gap-2 items-center !h-10 !px-4 rounded-lg !bg-gradient-to-r from-[#c72929] to-[#350000] !text-lg cursor-pointer !text-white !font-semibold"
                >
                  Cập nhật nhân sự
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ModalEditEmployee;
