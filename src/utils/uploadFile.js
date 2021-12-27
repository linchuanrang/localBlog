import axios from "axios"; // axios
import { getOssTicket } from "../../static/js/api"; //token
import { showToast } from "../../static/js/ding"; // 弹框提示
const getOssTickets = function () {
  return new Promise((resolve, reject) => {
    getOssTicket()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}
// 上传文件
export const uploadFile = async function (files, cb) {
  const {
    file,
    fileFormat,
    fileSizes,
  } = files;
  const {
    data
  } = await getOssTickets(); //获取ticket
  let uuid = getUuid();//随机文件名称
  let fileInfo = {
    isUpload: "", //是否已上传
    fileNames: "" //文件名称
  }
  for (let i = 0; i < file.length; i++) {
    let fileName = file[i].name; //获取文件名称
    let fileSize = file[i].size; //获取文件大小
    let fileMaxSize = fileSizes * 1024; //多少兆
    let size = fileSize / 1024; //当前文件大小
    const first = fileName.lastIndexOf(".");
    const second = fileName.length;
    const postf = fileName.substring(first, second);// 获取后缀名
    const filePathName = `${data.dir}${uuid}${postf}`;//ticken + 随机名称 + 文件后缀
    let arr = fileFormat.some(function (item, index, array) {
      return item == postf;
    })
    // Android 不兼容accept属性 给的提示
    if (!arr) {
      // showToast(`文件必须为${fileFormat}类型`);
    }
    if (fileName !== "") {
      fileInfo.isUpload = true;
      fileInfo.fileNames = fileName;
    }
    if (size > fileMaxSize) {
      fileInfo.isUpload = false;
      fileInfo.fileNames = "";
      // showToast(`文件大小超过${fileSizes}M`);
    } else if (size <= 0) {
      fileInfo.isUpload = false;
      fileInfo.fileName = "";
      // showToast("文件大小不能为0M！");
    }
    formDataFn(filePathName, data, fileInfo, cb)
  }
}
// formData格式
const formDataFn = function (filePathName, data, fileInfo, cb) {
  let formData = new FormData();
  formData.append("key", `${filePathName}`);
  formData.append("OSSAccessKeyId", data.accessid);
  formData.append("policy", data.policy);
  formData.append("signature", data.signature);
  formData.append("success_action_status", "200");
  formData.append("file", fileInfo.fileNames);
  axios.post(data.host, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  }).then((res) => {
    if (res.status === 200) {
      cb(filePathName, fileInfo) //ticket + 文件地址
    }
  }).catch((err) => {
    showToast(err);
  })
}
// 随机字母 + 数字
const S4 = function () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
// 随机名称
const getUuid = function () {
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  )
}