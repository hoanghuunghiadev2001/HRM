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
  Upload,
  UploadProps,
} from "antd";

import ModalLoading from "./modalLoading";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Image from "next/image";
import { getUserFromLocalStorage, Position } from "./api";
import { Department } from "@/lib/interface";

interface ModalAddNewEmployeeProps {
  open: boolean;
  onClose: () => void;
  department: Department[];
}

const ModalAddNewEmployee = ({
  onClose,
  open,
  department,
}: ModalAddNewEmployeeProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);

  const listPosition = async () => {
    const res = await fetch(`/api/departments/${selectedDepartmentId}`);
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setPositions(departmentsData.positions);
  };

  useEffect(() => {
    if (selectedDepartmentId) {
      listPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId]);

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
  const localUser = getUserFromLocalStorage();

  const maxDate = dayjs();

  const { Option } = Select;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    setDepartments(department);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onFinish = async (formData: any) => {
    setLoading(true);
    try {
      // Convert avatar File -> base64 nếu có
      // Chuẩn hóa object gửi đi
      const payload = {
        employeeCode: formData.employeeCode,
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        password: "123456",
        role: formData.role,
        avatar: imageUrl ?? null,

        workInfo: {
          departmentId: formData.department,
          positionId: formData.position,
          specialization: formData.specialization,
          joinedTBD: formData.joinedTBD,
          joinedTeSCC: formData.joinedTeSCC,
          seniorityStart: formData.seniorityStart,
          seniority: parseInt(formData.seniority, 10) || null,
          contractNumber: formData.contractNumber,
          contractDate: formData.contractDate,
          contractType: formData.contractType,
          contractEndDate: formData.contractEndDate,
        },

        personalInfo: {
          identityNumber: formData.identityNumber,
          issueDate: formData.issueDate,
          issuePlace: formData.issuePlace,
          hometown: formData.hometown,
          idAddress: formData.idAddress,
          education: formData.education,
          drivingLicense: formData.drivingLicense,
          toyotaCertificate: formData.toyotaCertificate,
          taxCode: formData.taxCode,
          insuranceNumber: formData.insuranceNumber,
          insuranceSalary: parseFloat(formData.insuranceSalary),
        },

        contactInfo: {
          phoneNumber: formData.phoneNumber,
          relativePhone: formData.relativePhone,
          companyPhone: formData.companyPhone,
          email: formData.email,
        },

        otherInfo: {
          workStatus: formData.workStatus,
          resignedDate: formData.resignedDate || null,
          documentsChecked: formData.documentsChecked ?? "",
          updatedAt: formData.updatedAt,
          VCB: formData.VCB,
          MTCV: formData.MTCV,
          PNJ: formData.PNJ,
        },
      };

      //   Gửi API
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        throw new Error(result.message || "Thêm nhân viên thất bại");
      }
      setLoading(false);
      onClose();
      return result;
    } catch (error) {
      setLoading(false);
      console.error(" Lỗi gửi dữ liệu:", error);
      throw error;
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
      // Get this url from response in real world.
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

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <>
      <Drawer
        title={<p className="text-2xl">Thêm nhân sự</p>}
        placement="right"
        // size={"large"}
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
              //   style={{ maxWidth: 600 }}
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
                    // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
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
                        quality={70} // giảm chất lượng xuống chút để nhẹ hơn
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
                  label="Vài trò"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Vài trò" allowClear>
                    <Option value="ADMIN">ADMIN</Option>
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
                <Form.Item
                  name="phoneNumber"
                  label="Số DT"
                  //   rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="relativePhone"
                  label="SĐT người thân"
                  //   rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="companyPhone"
                  label="SĐT Cty"
                  //   rules={[{ required: true }]}
                >
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
              <div className="mb-2 mt-4">
                <p className="text-xl ">3. Thông Tin Công việc:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  rules={[
                    { required: localUser?.role === "MANAGER" ? false : true },
                  ]}
                >
                  <Select
                    placeholder="Bộ phận"
                    disabled={localUser?.role === "MANAGER"}
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
                    disabled={localUser?.role === "MANAGER"}
                    allowClear
                    options={positions.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  ></Select>
                </Form.Item>
              </div>

              <Form.Item
                label={null}
                className="w-full flex justify-center mt-4"
              >
                <Button
                  htmlType="submit"
                  className="flex mt-4 relative  gap-2 items-center !h-10 !px-4 rounded-lg !bg-gradient-to-r from-[#c72929] to-[#350000] !text-lg cursor-pointer !text-white !font-semibold"
                >
                  Thêm nhân sự
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ModalAddNewEmployee;
