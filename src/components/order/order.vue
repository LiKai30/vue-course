<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderList" />
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{ scope.row.create_time | dataFormate }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改地址的对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressFormRules"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2" />
          </el-form-item>
        </el-form>

        <!-- 对话框的底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流进度的对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <el-timeline>
            <!-- 时间线 -->
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>

      <!-- 分页区域 -->
      <!-- layout展示的功能组件 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script>
import cityData from "./citydata.js"

export default {
  data() {
    return {
      // 获取订单列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前显示的多少条数据
        pagesize: 5
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区县",
            trigger: "blur"
          }
        ],
        address2: [
          {
            required: true,
            message: "请填写详细地址",
            trigger: "blur"
          }
        ]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败!")
      }
      console.log(res.data)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize的变化
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新获取用户数据
      this.getOrderList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showBox() {
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580")
      
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流进度失败!")
      }
      console.log(res.data)
      this.progressInfo = res.data
      this.progressVisible = true
    }
    
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>