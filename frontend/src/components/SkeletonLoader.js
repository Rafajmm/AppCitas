import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

export function SkeletonCard({ height = 200, width = '100%', className = '' }) {
  return (
    <Card className={`border-0 ${className}`} style={{ height }}>
      <Card.Body>
        <div className="skeleton" style={{ width, height: '100%' }} />
      </Card.Body>
    </Card>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={className}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="skeleton mb-2"
          style={{ 
            width: i === lines - 1 ? '60%' : '100%', 
            height: 16 
          }} 
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 48 }) {
  return (
    <div 
      className="skeleton rounded-circle"
      style={{ width: size, height: size }} 
    />
  );
}

export function SkeletonButton({ width = 120, height = 40 }) {
  return (
    <div 
      className="skeleton"
      style={{ width, height, borderRadius: 'var(--radius-sm)' }} 
    />
  );
}

export function SkeletonList({ items = 5 }) {
  return (
    <div>
      {[...Array(items)].map((_, i) => (
        <div 
          key={i} 
          className="d-flex align-items-center p-3"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <div className="skeleton rounded-circle me-3" style={{ width: 44, height: 44 }} />
          <div className="flex-grow-1">
            <div className="skeleton mb-2" style={{ width: '40%', height: 16 }} />
            <div className="skeleton" style={{ width: '60%', height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ cols = 4 }) {
  return (
    <Row>
      {[...Array(cols)].map((_, i) => (
        <Col md={12 / cols} key={i} className="mb-3 mb-md-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center p-4">
              <div className="skeleton me-3" style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)' }} />
              <div>
                <div className="skeleton mb-2" style={{ width: 60, height: 12 }} />
                <div className="skeleton" style={{ width: 40, height: 28 }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i}>
                <div className="skeleton" style={{ width: 80, height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(cols)].map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton" style={{ width: '70%', height: 16 }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <div className="skeleton mb-3" style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton mb-2" style={{ width: 120, height: 20 }} />
      <div className="skeleton" style={{ width: 80, height: 14 }} />
    </div>
  );
}

export default {
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonList,
  SkeletonStats,
  SkeletonTable,
  LoadingScreen
};
