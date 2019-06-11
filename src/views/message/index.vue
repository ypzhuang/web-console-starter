<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.messageId" :placeholder="$t('message.messageId')" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.appId" :placeholder="$t('message.appId')" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.messageClass" :placeholder="$t('message.messageClass')" clearable class="filter-item" style="width: 150px">
        <el-option v-for="item in messageClasses" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.status" :placeholder="$t('message.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statuses" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
      <el-date-picker v-model="listQuery.receiveDateFrom" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t('message.receiveDateFrom')" class="filter-item" :picker-options="pickerOptions" style="width: 195px" />
      <el-date-picker v-model="listQuery.receiveDateTo" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t('message.receiveDateTo')" class="filter-item" :picker-options="pickerOptions" style="width: 195px" />
      <el-date-picker v-model="listQuery.sendDateFrom" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t('message.sendDateFrom')" class="filter-item" :picker-options="pickerOptions" style="width: 195px" />
      <el-date-picker v-model="listQuery.sendDateTo" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t('message.sendDateTo')" class="filter-item" :picker-options="pickerOptions" style="width: 195px" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('search') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" :label="$t('id')" type="index" width="50px" />
      <el-table-column :label="$t('message.messageId')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.messageId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.appId')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.mqMsgId')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mqMsgId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.messageClass')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.messageClass | code2Name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.messageType')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.messageType | code2Name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.status')" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | code2Name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.content')" align="center">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.content" placement="top-start">
            <div>{{ scope.row.content | contentFilter }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.receiveDate')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.receiveDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.queuingDate')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.queuingDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.cancelDate')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cancelDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.delayLevel')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.delayLevel }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('message.reason')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.reason }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('actions')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleResendMessage(row)">
            {{ $t('message.resend') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList } from '@/api/message'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getCodes } from '@/utils/dict'

export default {
  name: 'Message',
  components: { Pagination },
  directives: { waves },
  filters: {
    contentFilter(content) {
      if (content) return content.substring(0, content.length > 10 ? 10 : content.length) + '*'.repeat(6)
      return ''
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      pickerOptions: {
        shortcuts: [{
          text: this.$t('today'),
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: this.$t('yesterday'),
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: this.$t('aWeekAgo'),
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      visible: false,
      messageClasses: getCodes('1021'),
      statuses: getCodes('1020'),
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        messageId: undefined,
        appId: undefined,
        status: undefined,
        messageClass: undefined,
        receiveDateFrom: undefined,
        receiveDateTo: undefined,
        sendDateFrom: undefined,
        sendDateTo: undefined
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.records
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleResendMessage(row) {
      this.$confirm('尚未实现', this.$t('warning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
      })
    }
  }
}
</script>
