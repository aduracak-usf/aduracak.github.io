window.ROOMWISE_DATA = {
  source: 'https://www.kaggle.com/datasets/pratyushpuri/online-furniture-orders-delivery-and-assembly-2025',
  sourceName: 'Online Furniture Orders: Delivery & Assembly 2025',
  recordCount: 1938,
  methodology: 'Category totals and average costs were calculated from all 1,938 rows in online_furniture_retailer.csv. Averages exclude blank cost cells. Counts show the number of orders in each category.',
  categories: [
    { name: 'Living Room', orders: 333, averageProduct: 1319.02, averageShipping: 66.74, averageAssembly: 65.41, assemblyRequests: 175 },
    { name: 'Bedroom', orders: 318, averageProduct: 1497.86, averageShipping: 69.53, averageAssembly: 57.25, assemblyRequests: 147 },
    { name: 'Kitchen', orders: 322, averageProduct: 1361.42, averageShipping: 68.53, averageAssembly: 62.46, assemblyRequests: 153 },
    { name: 'Dining Room', orders: 303, averageProduct: 1003.77, averageShipping: 68.32, averageAssembly: 58.6, assemblyRequests: 146 },
    { name: 'Office', orders: 324, averageProduct: 778.51, averageShipping: 69.46, averageAssembly: 63.08, assemblyRequests: 181 },
    { name: 'Outdoor', orders: 338, averageProduct: 975.99, averageShipping: 74.81, averageAssembly: 68.71, assemblyRequests: 179 },
  ],
  deliveryStatuses: [
    { name: 'Delivered', orders: 344 },
    { name: 'Failed delivery', orders: 326 },
    { name: 'Cancelled', orders: 318 },
    { name: 'Pending', orders: 319 },
    { name: 'In transit', orders: 316 },
    { name: 'Rescheduled', orders: 315 },
  ],
  demoPlans: [
    { id: 'plan-01', name: 'A calmer living room', room: 'Living room', style: 'Warm minimal', area: 320, budget: 5200, status: 'Planning' },
    { id: 'plan-02', name: 'Guest room refresh', room: 'Bedroom', style: 'Scandinavian', area: 180, budget: 2800, status: 'Considering' },
    { id: 'plan-03', name: 'Everyday kitchen update', room: 'Kitchen', style: 'Modern organic', area: 240, budget: 8200, status: 'In progress' },
    { id: 'plan-04', name: 'A focused work nook', room: 'Office', style: 'Mid-century', area: 125, budget: 1900, status: 'Complete' },
  ],
};
