<script>
  import api from '$/api';

  function isDateBetween(dateToCheck, startDate, endDate) {
    const date = new Date(dateToCheck);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  }

  function mapProduct(data) {
    return {
      id: data.data.id,
      company: data.data.company,
      code: data.data.code,
      date_updated: data.data.date_updated,
      data: data.data,
      delta: data.delta
    };
  }

  function mapStorage(data) {
    return {
      id: data.data.id,
      product: data.data.product,
      api_color_code: data.data.api_color_code,
      api_color_id: data.data.api_color_id,
      date_updated: data.data.date_updated,
      data: data.data,
      delta: data.delta
    };
  }

  async function fix(collection, mapping) {
    console.log('read');

    const start = new Date('2025-01-02T20:20:00');
    const end = new Date('2025-01-02T20:30:00');

    const data = await api.items('directus_revisions').readByQuery({
      fields: ['collection', 'data', 'delta'],
      filter: {
        _and: [
          {
            collection: {
              _eq: collection
            }
          }
        ]
      },
      limit: -1
    });
    console.log(data);

    const items = data.data.map(d => mapping(d));
    console.log(items);

    let filtered = [];
    if (collection === 'products') {
      filtered = items.filter(item => {
        return isDateBetween(item.date_updated, start, end) && item.company === 10;
      });
      console.log(filtered);

      const filteredIds = filtered.map(item => item.id);

      await api.items('products').updateMany(filteredIds, {
        enabled: true
      });
    } else if (collection === 'products_storage') {
      const axpolProducts = (
        await api.items('products').readByQuery({
          filter: { company: { _eq: 10 } },
          fields: ['id', 'storage', 'company'],
          limit: -1
        })
      ).data;
      console.log('axpol products', axpolProducts);
      const axpolProductsIds = axpolProducts.map(p => p.id);
      console.log('axpol products ids', axpolProductsIds);
      const axpolStoragesIds = axpolProducts.map(p => p.storage).flat();
      console.log('axpol storages ids', axpolStoragesIds);

      filtered = items.filter(item => {
        return isDateBetween(item.date_updated, start, end) && axpolProductsIds.includes(item.product);
      });
      console.log(filtered);

      const filteredIds = filtered.map(item => item.id);
      console.log('filtered ids', filteredIds);

      // const diff = {
      //   inAxpolButNotFiltered: axpolStoragesIds.filter(id => !filteredIds.includes(id)),
      //   inFilteredButNotAxpol: filteredIds.filter(id => !axpolStoragesIds.includes(id))
      // };
      // console.log('diff', diff);

      const doubleFiltered = filtered.filter(item => !item.api_color_code.startsWith('/A-'));
      console.log('double filtered', doubleFiltered);

      const doubleFilteredIds = doubleFiltered.map(item => item.id);

      // await api.items('products_storage').updateMany(doubleFilteredIds, {
      //   amount: null,
      //   enabled: true
      // });
    }
  }
</script>

<button on:click={() => fix('products', mapProduct)}>read products</button>
<button on:click={() => fix('products_storage', mapStorage)}>read products storage</button>
