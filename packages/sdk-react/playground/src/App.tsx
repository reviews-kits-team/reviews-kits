import { useReviews } from '@reviewskits/react'

function App() {
  const { data, isLoading, error } = useReviews({ 
    formId: 'rk_frm_live_4352ebf7c8008a48c5d70ae4' 
  })

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>React SDK Playground</h1>
      
      {isLoading && <p>Loading reviews...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
          <h3>Error</h3>
          <p>{error.message}</p>
          {error.details && <pre>{JSON.stringify(error.details, null, 2)}</pre>}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        {data?.reviews.map((review: any) => (
          <div key={review.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold' }}>{review.author.name}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>{review.author.title}</div>
            <div style={{ marginTop: '0.5rem' }}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div>
            <p>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
