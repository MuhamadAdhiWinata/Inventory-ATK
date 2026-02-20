// services/inventoryService.ts
import type { InventoryTransaction, InventoryResponse, TransactionType } from '#shared/types/IInventory'

// Mock data untuk Inventory In
const mockInventoryIn: InventoryTransaction[] = [
  {
    id: 1,
    transactionId: 'IN-001',
    type: 'IN',
    date: '2025-01-05',
    itemName: 'Steel Sheet',
    quantity: 500,
    sourceOrDestination: 'Supplier A',
    notes: 'Bulk order',
    unit: 'pcs'
  },
  {
    id: 2,
    transactionId: 'IN-002',
    type: 'IN',
    date: '2025-01-06',
    itemName: 'Aluminum Rod',
    quantity: 200,
    sourceOrDestination: 'Supplier B',
    notes: 'Standard delivery',
    unit: 'pcs'
  },
  {
    id: 3,
    transactionId: 'IN-003',
    type: 'IN',
    date: '2025-01-07',
    itemName: 'Motor',
    quantity: 50,
    sourceOrDestination: 'Supplier C',
    notes: 'Rush order',
    unit: 'unit'
  },
  {
    id: 4,
    transactionId: 'IN-004',
    type: 'IN',
    date: '2025-01-07',
    itemName: 'Bearing',
    quantity: 100,
    sourceOrDestination: 'Supplier A',
    notes: 'Regular stock',
    unit: 'pcs'
  },
  {
    id: 5,
    transactionId: 'IN-005',
    type: 'IN',
    date: '2025-01-08',
    itemName: 'Pump Unit',
    quantity: 25,
    sourceOrDestination: 'Warehouse',
    notes: 'Internal transfer',
    unit: 'unit'
  }
]

// Mock data untuk Inventory Out
const mockInventoryOut: InventoryTransaction[] = [
  {
    id: 1,
    transactionId: 'OUT-001',
    type: 'OUT',
    date: '2025-01-05',
    itemName: 'Steel Sheet',
    quantity: 150,
    sourceOrDestination: 'Production Line 1',
    notes: 'Production use',
    unit: 'pcs'
  },
  {
    id: 2,
    transactionId: 'OUT-002',
    type: 'OUT',
    date: '2025-01-06',
    itemName: 'Motor',
    quantity: 10,
    sourceOrDestination: 'Assembly Unit',
    notes: 'Assembly',
    unit: 'unit'
  },
  {
    id: 3,
    transactionId: 'OUT-003',
    type: 'OUT',
    date: '2025-01-07',
    itemName: 'Pump Unit',
    quantity: 15,
    sourceOrDestination: 'Customer XYZ',
    notes: 'Sales order',
    unit: 'unit'
  },
  {
    id: 4,
    transactionId: 'OUT-004',
    type: 'OUT',
    date: '2025-01-08',
    itemName: 'Aluminum Rod',
    quantity: 80,
    sourceOrDestination: 'Production Line 2',
    notes: 'Production use',
    unit: 'pcs'
  }
]

export class InventoryService {
  async getTransactions(
    type: TransactionType,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<InventoryResponse> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let data = type === 'IN' ? mockInventoryIn : mockInventoryOut
    
    // Filter search jika ada
    if (search) {
      data = data.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        transaction.itemName.toLowerCase().includes(search.toLowerCase()) ||
        transaction.sourceOrDestination.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      message: 'Transactions retrieved successfully',
      success: true,
      total: data.length
    }
  }
  
  async getTransactionById(id: number, type: TransactionType): Promise<InventoryTransaction | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const data = type === 'IN' ? mockInventoryIn : mockInventoryOut
    return data.find(transaction => transaction.id === id) || null
  }
  
  async createTransaction(
    transaction: Omit<InventoryTransaction, 'id' | 'transactionId'>
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    console.log('Creating transaction:', transaction)
    
    return {
      success: true,
      message: 'Transaction created successfully',
      transactionId: `IN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    }
  }
  
  async updateTransaction(
    id: number,
    updates: Partial<InventoryTransaction>
  ): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log(`Updating transaction ${id}:`, updates)
    
    return {
      success: true,
      message: 'Transaction updated successfully'
    }
  }
  
  async deleteTransaction(id: number, type: TransactionType): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log(`Deleting transaction ${id} from ${type}`)
    
    return {
      success: true,
      message: 'Transaction deleted successfully'
    }
  }
}

export const inventoryService = new InventoryService()